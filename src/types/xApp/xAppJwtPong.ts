// deno-lint-ignore-file camelcase

import type {AnyJson} from '../'

export interface xAppJwtPong extends AnyJson {
  pong: boolean,
  ott_uuidv4: string,
  app_uuidv4: string,
  app_name: string,
  iat: number,
  exp: number
}
