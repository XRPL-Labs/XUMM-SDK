import Debug from 'debug'
import {Meta} from './Meta'

import type {
  AnyJson,
  StorageDeleteResponse,
  StorageGetResponse,
  StorageSetResponse
} from './types'

import {throwIfError} from './utils'

const log = Debug('xumm-sdk:storage')

export class Storage {
  private Meta: Meta

  constructor (MetaObject: Meta) {
    log('Constructed')
    this.Meta = MetaObject
  }

  public async get (): Promise<AnyJson | null> {
    const call = await this.Meta.call<StorageGetResponse>('app-storage', 'GET')

    throwIfError(call)

    return call.data
  }

  public async set (data?: AnyJson): Promise<boolean> {
    const call = await this.Meta.call<StorageSetResponse>('app-storage', 'POST', data)

    throwIfError(call)

    return call.stored
  }

  public async delete (): Promise<boolean> {
    const call = await this.Meta.call<StorageDeleteResponse>('app-storage', 'DELETE')

    throwIfError(call)

    return call.stored
  }
}
