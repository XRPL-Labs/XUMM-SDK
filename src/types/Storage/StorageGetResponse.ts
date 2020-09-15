import type {
  StorageResponse,
  AnyJson
} from '../'

export interface StorageGetResponse extends StorageResponse {
  data: AnyJson | null
}
