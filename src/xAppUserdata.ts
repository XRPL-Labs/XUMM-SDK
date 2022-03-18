import {debug as Debug} from 'debug'
import type {Meta} from './Meta'

import type {
  AnyJson,
  xAppUserdataList,
  xAppUserdataGet,
  xAppUserdataSet,
  xAppUserdataDelete
} from './types'

import {throwIfError} from './utils'

const log = Debug('xumm-sdk:xapp:userdata')

export class xAppUserdata {
  private Meta: Meta

  constructor (MetaObject: Meta) {
    log('Constructed')
    this.Meta = MetaObject
  }

  public async list (): Promise<string[]> {
    const call = await this.Meta.call<xAppUserdataList>('userdata', 'GET')

    throwIfError(call)

    return call.keys
  }

  public async get (key: string | string[]): Promise<AnyJson> {
    const keys = Array.isArray(key) ? key.join(',') : key
    const call = await this.Meta.call<xAppUserdataGet>('userdata/' + keys, 'GET')

    throwIfError(call)

    return keys.split(',').length > 1 ? call.data : (call.data?.[keys] || {})
  }

  public async delete (key: string): Promise<Boolean> {
    const call = await this.Meta.call<xAppUserdataDelete>('userdata/' + key, 'DELETE')

    throwIfError(call)

    return call.persisted
  }

  public async set (key: string, data: AnyJson): Promise<Boolean> {
    const call = await this.Meta.call<xAppUserdataSet>('userdata/' + key, 'POST', data)

    throwIfError(call)

    return call.persisted
  }
}
