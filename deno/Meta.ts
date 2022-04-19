import {debug as Debug} from 'https://deno.land/x/debug/mod.ts'
import {throwIfError} from './utils.ts'
import {XummSdk, XummSdkJwt} from './index.ts'

import type {
  ApplicationDetails,
  Pong,
  CreatePayload,
  AnyJson,
  CuratedAssetsResponse,
  KycInfoResponse,
  KycStatusResponse,
  PossibleKycStatuses,
  XrplTransaction,
  RatesResponse,
  xAppJwtPong,
  XummApiError,
  xAppJwtOtt,
  UserTokenValidity,
  UserTokenResponse
} from './types/index.ts'

const log = Debug('xumm-sdk:meta')

export class Meta {
  private apiKey: string
  private apiSecret: string

  private isBrowser = false

  private jwtFlow = false
  private jwt?: string

  // Dependency injection: parent
  private injected = false
  private invoker?: XummSdk | XummSdkJwt

  public endpoint = 'https://xumm.app'

  constructor (apiKey: string, apiSecret: string) {
    log('Constructed')

    const uuidRe = new RegExp('^[a-f0-9]{8}\-[a-f0-9]{4}\-[a-f0-9]{4}\-[a-f0-9]{4}\-[a-f0-9]{12}$')

    const secret = {
      split: apiSecret.split(':'),
      uuidv4: ''
    }
    if (secret.split.length === 3 && secret.split.slice(0, 2).join(':') === 'xApp:OneTimeToken') {
      // xApp JWT flow
      secret.uuidv4 = secret.split[2]
      this.jwtFlow = true
    } else {
      // Regular SDK/API calls
      secret.uuidv4 = apiSecret
    }

    if (!uuidRe.test(apiKey) || !uuidRe.test(secret.uuidv4)) {
      if (!this.jwtFlow) {
        throw new Error('Invalid API Key and/or API Secret. Use dotenv or constructor params.')
      } else {
        throw new Error(
          'Invalid API Key and/or OTT (One Time Token). ' +
          'Provide OTT param (2nd param) or make sure `xAppToken` query param is present (Browser)'
        )
      }
    }

    if (typeof Deno !== 'undefined') {
      log('Running in Deno')
    } else {
      console.log('XUMM SDK: Running in browser')
      this.isBrowser = true
    }

    this.apiKey = apiKey
    this.apiSecret = secret.uuidv4

    if (this.jwtFlow) {
      // Eventloop: wait for _inject @ index.ts (XummSdk Constructor) to have happened
      Promise.resolve().then(() => this.authorize())
    }

    return this
  }

  public setEndpoint (endpoint: string): boolean {
    if (endpoint.match(/^http/)) {
      this.endpoint = endpoint.trim()
      return true
    }

    return false
  }

  private async authorize (): Promise<void> {
    const handleOttJwt = (JwtOttResponse: xAppJwtOtt) => {
      log('Resolved OTT, got JWT & OTT Data for xApp:', JwtOttResponse.app.name)
      this.jwt = JwtOttResponse.jwt
      if (this?.invoker) {
        if (this.invoker.constructor === XummSdkJwt) {
          this.invoker._inject(JwtOttResponse.ott, this)
        }
      }
    }

    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      if (typeof window.localStorage['XummSdkJwt'] === 'string') {
        const lsOttData = window.localStorage['XummSdkJwt'].split(':')
        if (lsOttData[0] === this.apiSecret) {
          // Restore from memory
          console.log('Restoring OTT from localStorage:', this.apiSecret)
          try {
            const JwtOttResponse = JSON.parse(lsOttData.slice(1).join(':'))
            handleOttJwt(JwtOttResponse)
            return
          } catch (e) {
            console.log('Error restoring OTT Data (JWT) from localStorage', (e as Error)?.message)
          }
        }
      }
    }

    const authorizeData: XummApiError | xAppJwtOtt = await this.call('authorize')
    if ((authorizeData as XummApiError)?.error?.code) {
      log(`Could not resolve API Key & OTT to JWT (already fetched? Unauthorized?)`)
      throwIfError(authorizeData)
    } else if ((authorizeData as xAppJwtOtt)?.jwt) {
      const JwtOttResponse = authorizeData as xAppJwtOtt

      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        window.localStorage['XummSdkJwt'] = this.apiSecret + ':' + JSON.stringify(JwtOttResponse)
      }

      handleOttJwt(JwtOttResponse)
    } else {
      throw new Error(`Unexpected response for xApp JWT authorize request`)
    }
  }

  public async call<T> (endpoint: string, httpMethod = 'GET', data?: CreatePayload | AnyJson): Promise<T> {
    const method = httpMethod.toUpperCase()

    try {
      let body
      if (typeof data !== 'undefined') {
        if (typeof data === 'object' && data !== null) {
          body = JSON.stringify(data)
        }
        if (typeof data === 'string') {
          body = data
        }
      }

      const headers = {
        'Content-Type': 'application/json'
      }

      if (!this.isBrowser) {
        // TODO: Deno
        Object.assign(headers, {
          'User-Agent': 'xumm-sdk/deno:1.1.5',
        })
      }

      if (!this.jwtFlow) {
        Object.assign(headers, {
          'x-api-key': this.apiKey,
          'x-api-secret': this.apiSecret
        })
      } else {
        if (endpoint === 'authorize') {
          Object.assign(headers, {
            'x-api-key': this.apiKey,
            'x-api-ott': this.apiSecret
          })
        } else {
          Object.assign(headers, {
            'Authorization': 'Bearer ' + this.jwt
          })
        }
      }

      const jwtEndpoints = [
        'authorize',
        'ping',
        'curated-assets',
        'rates',
        'payload',
        'userdata'
      ]

      const endpointType = this.jwtFlow && jwtEndpoints.indexOf(endpoint.split('/')[0]) > -1
        ? 'xapp-jwt'
        : 'platform'

      const request = await fetch(this.endpoint + '/api/v1/' + endpointType + '/' + endpoint, {
        method,
        body,
        headers
      })

      const json: T = await request.json()
      // log({json})
      return json
    } catch (e) {
      const err = new Error(`Unexpected response from XUMM API [${method}:${endpoint}]`)
      err.stack = (e as Error)?.stack || undefined
      throw err
    }
  }

  public async ping (): Promise<ApplicationDetails> {
    const pong = await this.call<Pong | xAppJwtPong>('ping')

    throwIfError(pong)

    if (typeof (pong as Pong).auth !== 'undefined') {
      return (pong as Pong).auth
    }

    const jwtPong = pong as xAppJwtPong
    if (typeof jwtPong.ott_uuidv4 !== 'undefined') {
      // return pong as xAppJwtPong
      return {
        application: {
          uuidv4: jwtPong.app_uuidv4,
          name: jwtPong.app_name
        },
        jwtData: jwtPong
      }

      // xumm-sdk:sample   pong: {
      //   xumm-sdk:sample     pong: true,
      //   xumm-sdk:sample     ott_uuidv4: '6b2997ca-a6ad-4a9b-80d7-1ef7fd98be54',
      //   xumm-sdk:sample     app_uuidv4: '8525e32b-1bd0-4839-af2f-f794874a80b0',
      //   xumm-sdk:sample     app_name: 'XRP TipBot for Twitter, Reddit & Discord',
      //   xumm-sdk:sample     iat: 1631744211,
      //   xumm-sdk:sample     exp: 1631830611
      //   xumm-sdk:sample   }
    }

    throw new Error(`Unexpected response for ping request`)
  }

  public async getCuratedAssets (): Promise<CuratedAssetsResponse> {
    return await this.call<CuratedAssetsResponse>('curated-assets')
  }

  public async getRates (currencyCode: string): Promise<RatesResponse> {
    return await this.call<RatesResponse>('rates/' + currencyCode.trim().toUpperCase())
  }

  public async getKycStatus (userTokenOrAccount: string): Promise<keyof PossibleKycStatuses> {
    if (userTokenOrAccount.trim().match(/^r/)) {
      const call = await this.call<KycInfoResponse>('kyc-status/' + userTokenOrAccount.trim())
      return call?.kycApproved ? 'SUCCESSFUL' : 'NONE'
    } else {
      const call = await this.call<KycStatusResponse>('kyc-status', 'POST', {
        user_token: userTokenOrAccount
      })
      return call?.kycStatus || 'NONE'
    }
  }

  public async getTransaction (txHash: string): Promise<XrplTransaction> {
    return await this.call<XrplTransaction>('xrpl-tx/' + txHash.trim())
  }

  public async verifyUserTokens (userTokens: string[]): Promise<UserTokenValidity[]> {
    return (await this.call<UserTokenResponse>('user-tokens', 'POST', {
      tokens: Array.isArray(userTokens) ? userTokens : [userTokens]
    })).tokens
  }

  // Internal
  public _inject (Invoker: XummSdk): void {
    if (!this.injected) {
      this.invoker = Invoker
    } else {
      throw new Error('Cannot `_inject` twice')
    }
  }
}
