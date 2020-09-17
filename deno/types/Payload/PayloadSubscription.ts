import type {XummGetPayloadResponse as XummPayload} from '../index.ts'

export interface PayloadSubscription {
  payload: XummPayload,
  resolved: Promise<unknown> | undefined
  resolve: (resolveData?: unknown) => void
  websocket: WebSocket
}
