import {debug as Debug} from 'https://deno.land/x/debug/mod.ts'
import type {Meta} from './Meta.ts'

import type {
  AnyJson,
  xAppOttData,
  xAppEventResponse,
  xAppPushResponse,
  xAppEventPushPostBody
} from './types/index.ts'

import {throwIfError} from './utils.ts'

const log = Debug('xumm-sdk:xapp')

export class xApp {
  private Meta: Meta

  constructor (MetaObject: Meta) {
    log('Constructed')
    this.Meta = MetaObject
  }

  public async get (ott: string): Promise<xAppOttData | null> {
    const call = await this.Meta.call<xAppOttData>('xapp/ott/' + ott, 'GET')

    throwIfError(call)

    return call
  }

  public async event (data: xAppEventPushPostBody): Promise<xAppEventResponse> {
    const call = await this.Meta.call<xAppEventResponse>('xapp/event', 'POST', data)

    throwIfError(call)

    return call
  }

  public async push (data: xAppEventPushPostBody): Promise<xAppPushResponse> {
    const call = await this.Meta.call<xAppPushResponse>('xapp/push', 'POST', data)

    throwIfError(call)

    return call
  }
}
