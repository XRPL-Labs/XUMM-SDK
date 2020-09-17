import type {
  AnyJson,
  XummGetPayloadResponse as XummPayload
} from '../index.ts'

export interface SubscriptionCallbackParams {
  uuid: string
  data: AnyJson
  resolve: (resolveData?: any) => void,
  payload: XummPayload
}
