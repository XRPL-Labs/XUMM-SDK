import type {XummGetPayloadResponse as XummPayload} from '../index.ts'

export interface PayloadSubscription {
  payload: XummPayload,
  resolved: Promise<any> | undefined
  resolve: (resolveData?: any) => void
  websocket: WebSocket
}
