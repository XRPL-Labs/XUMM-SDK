import type {AnyJson} from '../index.ts'

export interface xAppEventPushPostBody extends AnyJson {
  // deno-lint-ignore camelcase
  user_token: string,
  subtitle?: string,
  body?: string,
  data?: AnyJson,
  silent?: boolean
}
