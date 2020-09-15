import type WebSocket from 'ws'
import type {XummGetPayloadResponse as XummPayload} from '../'

export interface PayloadSubscription {
  payload: XummPayload,
  resolved: Promise<any> | undefined
  resolve: (resolveData?: any) => void
  websocket: WebSocket
}
