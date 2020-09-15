import type {
  StorageResponse,
  AnyJson
} from '../'

export interface StorageSetResponse extends StorageResponse {
  stored: boolean
  data: AnyJson
}
