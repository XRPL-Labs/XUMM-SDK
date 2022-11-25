import type {AnyJson} from './'

export interface JwtUserdataList extends AnyJson {
  operation: 'LIST'
  keys: string[]
  count: number
}

export interface JwtUserdataGet extends AnyJson {
  operation: 'RETRIEVE'
  data: AnyJson
  keys: string[]
  count: number
}

export interface JwtUserdataSet extends AnyJson {
  operation: 'PERSIST'
  persisted: boolean
}

export interface JwtUserdataDelete extends AnyJson {
  operation: 'REMOVE'
  persisted: boolean
}
