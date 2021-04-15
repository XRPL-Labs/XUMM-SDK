import type {AnyJson} from '../index.ts'

export interface xAppOttData {
  locale?: string,
  version?: string,
  account?: string,
  accountaccess?: string,
  accounttype?: string,
  style?: string,
  origin?: AnyJson,
  user: string
}
