import {debug as Debug} from 'debug'
import {Meta} from './Meta'
import {Storage} from './Storage'
import {Payload} from './Payload'
import {xApp} from './xApp'
import type * as Types from './types/xumm-api'
import type {xAppOttData, UserTokenValidity, xAppJwtOtt} from './types/index'

const log = Debug('xumm-sdk')

class XummSdk {
  private Meta: Meta

  public storage: Storage
  public payload: Payload
  public xApp: xApp

  constructor (apiKey?: string, apiSecret?: string) {
    log('Constructed')

    this.Meta = new Meta(
      apiKey || this.getEnv('XUMM_APIKEY'),
      apiSecret || this.getEnv('XUMM_APISECRET')
    )

    this.storage = new Storage(this.Meta)
    this.payload = new Payload(this.Meta)
    this.xApp = new xApp(this.Meta)

    this.Meta._inject(this)

    return this
  }

  private getEnv (arg: string): string {
    let value = ''

    try {
      /* Deno */ // @ts-ignore
      /* Deno */ value = typeof Deno !== 'undefined' ? (Deno.env.get(arg) || '') : ''
      /* Node */ value = process?.env[arg] || ''
    } catch (_e) {
      // Couldn't load .env
    }

    return value
  }

  /**
   * Proxy methods to Meta class below
   */

  public ping () {
    return this.Meta.ping()
  }

  public getCuratedAssets () {
    return this.Meta.getCuratedAssets()
  }

  public getRates (currencyCode: string) {
    return this.Meta.getRates(currencyCode)
  }

  public getKycStatus (userTokenOrAccount: string) {
    return this.Meta.getKycStatus(userTokenOrAccount)
  }

  public getTransaction (txHash: string) {
    return this.Meta.getTransaction(txHash)
  }

  public verifyUserTokens (userTokens: string[]) {
    return this.Meta.verifyUserTokens(userTokens)
  }

  public async verifyUserToken (token: string): Promise<UserTokenValidity | null> {
    const tokenResults = await this.Meta.verifyUserTokens([token])
    return Array.isArray(tokenResults) && tokenResults.length === 1
      ? tokenResults[0]
      : null
  }

  public setEndpoint (endpoint: string): boolean {
    return this.Meta.setEndpoint(endpoint)
  }

  public caught (error: Error) {
    throw error
  }
}

interface XummJwtOptionsStore {
  get: (ott: string) => xAppJwtOtt | void
  set: (ott: string, ottData: xAppJwtOtt) => void
}

export interface XummSdkJwtOptions {
  store?: XummJwtOptionsStore,
  fatalHandler?: (error: Error) => void
}

class XummSdkJwt extends XummSdk {
  private ottResolved: Promise<xAppOttData | void>
  private jwt?: string
  private resolve: (ottData: xAppOttData) => void
  private reject: (error: Error) => void
  public fatalHandler?: (error: Error) => void

  private store: XummJwtOptionsStore

  constructor (apiKeyOrJwt: string, ott?: string, options?: XummSdkJwtOptions) {
    let _ott = String(ott || '').trim().toLowerCase()
    const isRawJwt = apiKeyOrJwt.length !== 36

    /**
     * xAppToken from URL to param if not explicitly provided
     */
    if (!isRawJwt) {
      if (
        typeof ott === 'undefined'
        && typeof window !== 'undefined'
        && typeof window.URLSearchParams !== 'undefined'
      ) {
        const urlSearchParams = new window.URLSearchParams(window?.location?.search || '')

        for (const pair of urlSearchParams.entries()) {
          if (pair[0] === 'xAppToken') {
            _ott = pair[1].toLowerCase().trim()
          }
        }

        if (_ott === '') {
          // Check if we have something in history
          if (typeof window?.localStorage?.['XummSdkJwt'] === 'string') {
            try {
              const localStorageJwtData = window?.localStorage?.['XummSdkJwt']?.split(':')
              const localStorageJwt = JSON.parse(localStorageJwtData?.slice(1)?.join(':'))
              if (localStorageJwt?.jwt) {
                const jwtContents = JSON.parse(atob(localStorageJwt.jwt.split('.')?.[1]))
                if (jwtContents?.exp) {
                  const validForSec = jwtContents?.exp - Math.floor((new Date()).getTime() / 1000)
                  console.log('Restoring OTT ' + localStorageJwtData?.[0])
                  if (validForSec > 60 * 60) {
                    _ott = localStorageJwtData?.[0]
                  } else {
                    console.log('Skip restore: not valid for one more hour')
                  }
                }
              }
            } catch (e) {
              console.log('JWT Restore Error', e)
            }
          }
        }
      }
    }

    super(apiKeyOrJwt, !isRawJwt && _ott !== ''
      ? 'xApp:OneTimeToken:' + _ott
      : 'RAWJWT:' + apiKeyOrJwt
    )

    this.resolve = (ottData: xAppOttData) => {
      log('OTT data resolved', ottData)
    }

    this.reject = (error: Error) => {
      log('OTT data rejected', error.message)
    }

    this.ottResolved = isRawJwt
      ? Promise.resolve()
      : new Promise((resolve, reject) => {
        this.resolve = resolve
        this.reject = reject
      })

    if (options?.fatalHandler) {
      this.fatalHandler = options.fatalHandler
    }

    this.store = {
      get (uuid) {
        log('[JwtStore] » Builtin JWT store GET')

        // Default store: localStorage
        if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
          if (typeof window.localStorage['XummSdkJwt'] === 'string') {
            const lsOttData = window.localStorage['XummSdkJwt'].split(':')
            if (lsOttData[0] === uuid) {
              // Restore from memory
              log('Restoring OTT from localStorage:', uuid)
              try {
                return JSON.parse(lsOttData.slice(1).join(':'))
              } catch (e) {
                log('Error restoring OTT Data (JWT) from localStorage', (e as Error)?.message)
              }
            }
          }
        }
      },
      set (uuid: string, ottData: xAppJwtOtt) {
        log('[JwtStore] » Builtin JWT store SET', uuid)

        // Default store: localStorage
        if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
          window.localStorage['XummSdkJwt'] = uuid + ':' + JSON.stringify(ottData)
        }
      }
    }

    if (options?.store?.get) {
      this.store.get = options.store.get
    }

    if (options?.store?.set) {
      this.store.set = options.store.set
    }

    if (isRawJwt) {
      this.reject(new Error('Not in OTT flow: in raw JWT (OAuth2-like) flow'))
      log('Using JWT (Raw, OAuth2) flow')
    } else{
      log('Using JWT (xApp) flow')
    }
  }

  public _jwtStore (invoker: Meta, persistJwt: (jwt: string) => void): XummJwtOptionsStore {
    if (invoker && invoker?.constructor === Meta) {
      return {
        get: uuid => {
          log('[JwtStore] Proxy GET')
          return this.store?.get(uuid)
        },
        set: (uuid: string, ottData: xAppJwtOtt) => {
          log('[JwtStore] Proxy SET')
          this.resolve(ottData.ott)
          persistJwt(ottData.jwt)
          this.jwt = ottData.jwt

          return this.store?.set(uuid, ottData)
        }
      }
    }

    throw new Error('Invalid _jwtStore invoker')
  }

  public async getOttData (): Promise<xAppOttData> {
    const resolved = await this.ottResolved

    if (resolved) {
      return resolved
    }

    throw new Error('Called getOttData on a non OTT-JWT flow')
  }

  public async getJwt (): Promise<string | undefined> {
    await this.ottResolved
    return this.jwt
  }

  public caught (error: Error) {
    this.reject(error)
  }
}

export {
  XummSdk,
  XummSdkJwt
}

export type {
  Types as XummTypes
}
