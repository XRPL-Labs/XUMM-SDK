import Debug from 'debug'
import {Meta, AnyJson} from './Meta'

const log = Debug('xumm-sdk:storage')

export interface StorageResponse {
  application: {
    name: string
    uuidv4: string
  }
}

export interface StorageGetResponse extends StorageResponse {
  data: AnyJson | null
}

export interface StorageSetResponse extends StorageResponse {
  stored: boolean
  data: AnyJson
}

export interface StorageDeleteResponse extends StorageResponse {
  stored: boolean
  data: null
}

export class Storage {
  private Meta: Meta

  constructor (MetaObject: Meta) {
    log('Constructed')
    this.Meta = MetaObject
  }

  public async get (): Promise<AnyJson | null> {
    const call = await this.Meta.call<StorageGetResponse>('app-storage', 'GET')
    return call.data
  }

  public async set (data?: AnyJson): Promise<boolean> {
    const call = await this.Meta.call<StorageSetResponse>('app-storage', 'POST', data)
    return call.stored
  }

  public async delete (): Promise<boolean> {
    const call = await this.Meta.call<StorageDeleteResponse>('app-storage', 'DELETE')
    return call.stored
  }
}
