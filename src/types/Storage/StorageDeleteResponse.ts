import type {StorageResponse} from '../index.ts'

export interface StorageDeleteResponse extends StorageResponse {
  stored: boolean
  data: null
}
