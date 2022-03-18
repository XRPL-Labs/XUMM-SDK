import type {w3cwebsocket as WebSocket} from 'websocket'
import type {XummGetPayloadResponse as XummPayload} from '../'

export interface PayloadSubscription {
  payload: XummPayload,
  resolved: Promise<unknown> | undefined
  resolve: (resolveData?: unknown) => void
  websocket: WebSocket
}
