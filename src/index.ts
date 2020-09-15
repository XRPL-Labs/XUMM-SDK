import Debug from 'debug'
import * as dotenv from 'dotenv'
import {Meta} from './Meta'
import {Storage} from './Storage'
import {Payload} from './Payload'
import type * as Types from './types/xumm-api'

const log = Debug('xumm-Meta')

class XummSdk {
  private Meta: Meta

  public storage: Storage
  public payload: Payload

  constructor (apiKey?: string, apiSecret?: string) {
    log('Constructed')

    try {
      dotenv.config()
    } catch (e) {
      // Couldn't load .env
    }

    this.Meta = new Meta(
      apiKey || process.env.XUMM_APIKEY || '',
      apiSecret || process.env.XUMM_APISECRET || ''
    )

    this.storage = new Storage(this.Meta)
    this.payload = new Payload(this.Meta)

    return this
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
}

export {
  XummSdk
}

export type {
  Types as XummTypes
}
