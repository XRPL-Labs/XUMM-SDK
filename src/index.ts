import {debug as Debug} from 'debug'
import * as dotenv from 'dotenv'
import {Meta} from './Meta'
import {Storage} from './Storage'
import {Payload} from './Payload'
import {xApp} from './xApp'
import type * as Types from './types/xumm-api'

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
      /* Deno */ // @ts-ignore
      /* Deno */ value = typeof Deno !== 'undefined' ? (Deno.env.get(arg) || '') : ''
      /* Node */ dotenv.config()
      /* Node */ value = process?.env[arg] || ''
    } catch (e) {
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
