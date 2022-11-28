import {debug as Debug} from 'https://deno.land/x/debug/mod.ts'
import type {Meta} from './Meta.ts'

import type {
  EventResponse,
  PushResponse,
  EventPushPostBody
} from './types/index.ts'

import {JwtUserdata} from './JwtUserdata.ts'

import {throwIfError} from './utils.ts'

const log = Debug('xumm-sdk:xapp')

export class Push {
  private Meta: Meta
  private userdata: JwtUserdata

  constructor (MetaObject: Meta) {
    log('Constructed')
    this.Meta = MetaObject
    // Backwards compatibility for old Sdk.xApp.userdata users
    // - as xApps used to be the only JWT issuing env. - PKCE now is as well
    this.userdata = new JwtUserdata(MetaObject)
  }

  public async event (data: EventPushPostBody): Promise<EventResponse> {
    const call = await this.Meta.call<EventResponse>('xapp/event', 'POST', data)

    throwIfError(call)

    return call
  }

  public async notification (data: EventPushPostBody): Promise<PushResponse> {
    const call = await this.Meta.call<PushResponse>('xapp/push', 'POST', data)

    throwIfError(call)

    return call
  }
}
