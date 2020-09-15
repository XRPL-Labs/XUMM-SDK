import type {StorageResponse} from '../'

export interface StorageDeleteResponse extends StorageResponse {
  stored: boolean
  data: null
}
