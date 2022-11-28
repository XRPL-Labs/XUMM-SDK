import type {AnyJson} from '../index.ts'

export interface EventPushPostBody extends AnyJson {
  'user_token'?: string,
  'user_uuid'?: string,
  'user_account'?: string,
  subtitle?: string,
  body?: string,
  data?: AnyJson,
  silent?: boolean
}
