import {debug as Debug} from 'https://deno.land/x/debug/mod.ts'
import 'https://deno.land/x/dotenv/load.ts'
import {Meta} from './Meta.ts'
import {Storage} from './Storage.ts'
import {Payload} from './Payload.ts'
import {xApp} from './xApp.ts'
import type * as Types from './types/xumm-api/index.ts'

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

    return this
  }

  private getEnv (arg: string): string {
    let value = ''

    try {
      value = typeof Deno !== 'undefined' ? (Deno.env.get(arg) || '') : ''
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

  public getKycStatus (userToken: string) {
    return this.Meta.getKycStatus(userToken)
  }

  public getTransaction (txHash: string) {
    return this.Meta.getTransaction(txHash)
  }
}

export {
  XummSdk
}

export type {
  Types as XummTypes
}
