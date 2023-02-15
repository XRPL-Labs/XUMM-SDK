import type {AnyJson} from '../'

export interface xAppUserDeviceData extends AnyJson {
  currency: string
  platform: string
}

export interface xAppOriginData extends AnyJson {
  payload?: string
}

export interface xAppOrigin extends AnyJson {
  type?: string,
  data?: xAppOriginData
}

export interface xAppAccountInfo extends AnyJson {
  account: string,
  name?: string,
  domain?: string,
  blocked: boolean,
  source: string,
  kycApproved: boolean,
  proSubscription: boolean
  slug: string | null,
  profileUrl: string | null,
  accountSlug: string | null,
  payString: string | null
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
  user_device?: xAppUserDeviceData,
  account_info: xAppAccountInfo,
  nodetype?: string,
  currency?: string,
  subscriptions?: string[]
}
