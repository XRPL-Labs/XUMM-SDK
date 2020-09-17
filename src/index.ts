import {debug as Debug} from 'https://deno.land/x/debug/mod.ts'
import {Meta} from './Meta.ts'
import {Storage} from './Storage.ts'
import {Payload} from './Payload.ts'
import type * as Types from './types/xumm-api/index.ts'

const log = Debug('xumm-Meta')

class XummSdk {
  private Meta: Meta

  public storage: Storage
  public payload: Payload

  constructor (apiKey?: string, apiSecret?: string) {
    log('Constructed')

    this.Meta = new Meta(
      apiKey || '',
      apiSecret || ''
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
