import type WebSocket from 'ws'
import type {XummGetPayloadResponse as XummPayload} from '../'

export interface PayloadSubscription {
  payload: XummPayload,
  resolved: Promise<unknown> | undefined
  resolve: (resolveData?: unknown) => void
  websocket: WebSocket
}
