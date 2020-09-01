import Debug from 'debug'
import {Meta} from './Meta'
import {Storage} from './Storage'
import {Payload} from './Payload'
import type * as Types from './types/xumm-api'

const log = Debug('xumm-Meta')

class XummSdk {
  private Meta: Meta
  public storage: Storage
  public payload: Payload

  constructor (apiKey: string, apiSecret: string) {
    log('Constructed')

    this.Meta = new Meta(apiKey, apiSecret)

    this.storage = new Storage(this.Meta)
    this.payload = new Payload(this.Meta)

    return this
  }

  /**
   * Proxy methods to Meta class
   */

  public async ping () {
    return this.Meta.ping()
  }

  public async getCuratedAssets () {
    return this.Meta.getCuratedAssets()
  }
}

export {
  XummSdk
}

export type {
  Types
}
