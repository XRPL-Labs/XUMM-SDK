import type {AnyJson} from '../'

export interface xAppUserdataList extends AnyJson {
  operation: 'LIST'
  keys: string[]
  count: number
}

export interface xAppUserdataGet extends AnyJson {
  operation: 'RETRIEVE'
  data: AnyJson
  keys: string[]
  count: number
}

export interface xAppUserdataSet extends AnyJson {
  operation: 'PERSIST'
  persisted: boolean
}

export interface xAppUserdataDelete extends AnyJson {
  operation: 'REMOVE'
  persisted: boolean
}
