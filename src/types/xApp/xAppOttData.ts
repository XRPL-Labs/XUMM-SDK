import type {AnyJson} from '../'

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

export interface xAppOttData {
  locale?: string,
  version?: string,
  account?: string,
  accountaccess?: string,
  accounttype?: string,
  style?: string,
  origin?: xAppOrigin,
  user: string,
  user_device?: xAppUserDeviceData
}
