import type {AnyJson} from '../'

export interface xAppUserdataList extends AnyJson {
  operation: 'LIST'
  keys: string[]
  count: Number
}

export interface xAppUserdataGet extends AnyJson {
  operation: 'RETRIEVE'
  data: AnyJson
  keys: string[]
  count: Number
}

export interface xAppUserdataSet extends AnyJson {
  operation: 'PERSIST'
  persisted: Boolean
}

export interface xAppUserdataDelete extends AnyJson {
  operation: 'REMOVE'
  persisted: Boolean
}
