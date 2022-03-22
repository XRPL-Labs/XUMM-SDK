import {debug as Debug} from 'debug'
import * as dotenv from 'dotenv'
import {Meta} from './Meta'
import {Storage} from './Storage'
import {Payload} from './Payload'
import {xApp} from './xApp'
import type * as Types from './types/xumm-api'
import type {xAppOttData, UserTokenValidity} from './types/index'

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
      /* Node */ dotenv.config()
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
}

class XummSdkJwt extends XummSdk {
  private ottResolved: Promise<xAppOttData>
  private resolve: (ottData: xAppOttData) => void

  constructor (apiKey: string, ott?: string) {
    let _ott = String(ott || '').trim().toLowerCase()

    /**
     * xAppToken from URL to param if not explicitly provided
     */
    if (typeof ott === 'undefined' && typeof window !== 'undefined' && typeof window.URLSearchParams !== 'undefined') {
      console.log(window?.location?.search || '')
      const urlSearchParams = new window.URLSearchParams(window?.location?.search || '')

      for (const pair of urlSearchParams.entries()) {
        if (pair[0] === 'xAppToken') {
          _ott = pair[1].toLowerCase().trim()
        }
      }
    }

    super(apiKey, 'xApp:OneTimeToken:' + _ott)

    this.resolve = (ottData: xAppOttData) => {
      log('OTT data resolved', ottData)
    }
    this.ottResolved = new Promise(resolve => this.resolve = resolve)

    log('Using JWT (xApp) flow')
  }

  public _inject (ottData: xAppOttData, invoker: Meta): void {
    if (invoker && invoker?.constructor === Meta) {
      this.resolve(ottData)
    }
  }

  public async getOttData (): Promise<xAppOttData> {
    return await this.ottResolved
  }
}

export {
  XummSdk,
  XummSdkJwt
}

export type {
  Types as XummTypes
}
