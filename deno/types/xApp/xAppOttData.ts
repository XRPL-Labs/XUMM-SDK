import type {AnyJson} from '../index.ts'

export interface xAppUserDeviceData extends AnyJson {
  currency?: string
}

export interface xAppOriginData extends AnyJson {
  payload?: string
}

export interface xAppOrigin extends AnyJson {
  type?: string,
  data?: xAppOriginData
}

export interface xAppOttData extends AnyJson {
  locale?: string,
  version?: string,
  account?: string,
  accountaccess?: string,
  accounttype?: string,
  style?: string,
  origin?: xAppOrigin,
  user: string,
  'user_device'?: xAppUserDeviceData,
  nodetype?: string,
  currency?: string
}
