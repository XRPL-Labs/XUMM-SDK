import {debug as Debug} from 'https://deno.land/x/debug/mod.ts'
import type {Meta} from './Meta.ts'

import type {
  AnyJson,
  xAppUserdataList,
  xAppUserdataGet,
  xAppUserdataSet,
  xAppUserdataDelete
} from './types/index.ts'

import {throwIfError} from './utils.ts'

const log = Debug('xumm-sdk:xapp:userdata')

export class xAppUserdata {
  private Meta: Meta

  constructor (MetaObject: Meta) {
    log('Constructed')
    this.Meta = MetaObject
  }

  public async list (): Promise<string[]> {
    const call = await this.Meta.call<xAppUserdataList>('xapp/userdata', 'GET')

    throwIfError(call)

    return call.keys
  }

  public async get (key: string | string[]): Promise<AnyJson> {
    const keys = Array.isArray(key) ? key.join(',') : key
    const call = await this.Meta.call<xAppUserdataGet>('xapp/userdata/' + keys, 'GET')

    throwIfError(call)

    return Array.isArray(key) ? call.data : (call.data?.[key] || {})
  }

  public async delete (key: string): Promise<Boolean> {
    const call = await this.Meta.call<xAppUserdataDelete>('xapp/userdata/' + key, 'DELETE')

    throwIfError(call)

    return call.persisted
  }

  public async set (key: string, data: AnyJson): Promise<Boolean> {
    const call = await this.Meta.call<xAppUserdataSet>('xapp/userdata/' + key, 'POST', data)

    throwIfError(call)

    return call.persisted
  }
}
