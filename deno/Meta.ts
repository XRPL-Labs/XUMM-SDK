import {debug as Debug} from 'https://deno.land/x/debug/mod.ts'
import {throwIfError} from './utils.ts'
import {XummSdk, XummSdkJwt} from './index.ts'

import type {
  ApplicationDetails,
  Pong,
  JwtPong,
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
    } else if (secret.split.length > 1 && secret.split[0] === 'RAWJWT') {
      this.jwtFlow = true
      this.jwt = secret.split.slice(1).join(':')
    } else {
      // Regular SDK/API calls
      secret.uuidv4 = apiSecret
    }

    if (!uuidRe.test(apiKey) || !uuidRe.test(secret.uuidv4)) {
      if (!this.jwtFlow) {
        throw new Error('Invalid API Key and/or API Secret. Use dotenv or constructor params.')
      } else {
        if (!this.jwt) {
          throw new Error(
            'Invalid API Key and/or OTT (One Time Token). ' +
            'Provide OTT param (2nd param) or make sure `xAppToken` query param is present (Browser)'
          )
        }
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

    if (this.jwtFlow && !this.jwt) {
      // Eventloop: wait for _inject @ index.ts (XummSdk Constructor) to have happened
      Promise.resolve()
        .then(() => this.authorize())
        .catch(e => {
          log('Authorize error:', e.message)
          if (this?.invoker) {
            this.invoker.caught(e)
          }
        })
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
    log('JWT Authorize', this.apiSecret)

    let store
    if (this?.invoker && this.invoker.constructor === XummSdkJwt) {
      store = this.invoker._jwtStore(this, (jwt: string) => this.jwt = jwt)
    }

    const authorizeData: XummApiError | xAppJwtOtt = store?.get(this.apiSecret) || await this.call('authorize')

    if ((authorizeData as XummApiError)?.error?.code) {
      log(`Could not resolve API Key & OTT to JWT (already fetched? Unauthorized?)`)

      if (this?.invoker && this.invoker.constructor === XummSdkJwt && this?.invoker?.fatalHandler) {
        this.invoker.fatalHandler(new Error((authorizeData as XummApiError).error.reference))
      } else {
        throwIfError(authorizeData)
      }
    } else if ((authorizeData as xAppJwtOtt)?.jwt) {
      const JwtOttResponse = authorizeData as xAppJwtOtt

      store?.set(this.apiSecret, JwtOttResponse)
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
          'User-Agent': 'xumm-sdk/deno:1.3.5',
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
        ? 'jwt'
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
    const pong = await this.call<Pong | JwtPong | xAppJwtPong>('ping')

    throwIfError(pong)

    if (typeof (pong as Pong).auth !== 'undefined') {
      return (pong as Pong).auth
    }

    if (typeof (pong as xAppJwtPong)?.ott_uuidv4 !== 'undefined') {
      // return pong as xAppJwtPong
      return {
        application: {
          uuidv4: (pong as xAppJwtPong).app_uuidv4,
          name: (pong as xAppJwtPong).app_name
        },
        jwtData: (pong as xAppJwtPong)
      }
    }

    if (typeof (pong as JwtPong)?.usertoken_uuidv4 !== 'undefined') {
      // return pong as JwtPong
      return {
        application: {
          uuidv4: (pong as JwtPong).client_id,
          name: (pong as JwtPong).app_name
        },
        jwtData: (pong as JwtPong)
      }
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
