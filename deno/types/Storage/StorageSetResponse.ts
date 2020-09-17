import type {
  StorageResponse,
  AnyJson
} from '../index.ts'

export interface StorageSetResponse extends StorageResponse {
  stored: boolean
  data: AnyJson
}
