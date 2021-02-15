import type {AnyJson} from '../'

export interface xAppEventPushPostBody extends AnyJson {
  // deno-lint-ignore camelcase
  user_token: string,
  subtitle?: string,
  body?: string,
  data?: AnyJson
}
