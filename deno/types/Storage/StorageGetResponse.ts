import type {
  StorageResponse,
  AnyJson
} from '../index.ts'

export interface StorageGetResponse extends StorageResponse {
  data: AnyJson | null
}
