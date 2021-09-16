import type {AnyJson, xAppOttData} from '../'

interface xAppJwtOttApp extends AnyJson {
  name: string
}

export interface xAppJwtOtt {
  ott: xAppOttData,
  app: xAppJwtOttApp,
  jwt: string
}
