import type {
  AnyJson,
  XummGetPayloadResponse as XummPayload
} from '../'

export interface SubscriptionCallbackParams {
  uuid: string
  data: AnyJson
  resolve: (resolveData?: any) => void,
  payload: XummPayload
}
