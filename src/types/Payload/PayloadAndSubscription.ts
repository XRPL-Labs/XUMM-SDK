import type {
  PayloadSubscription,
  XummPostPayloadResponse as CreatedPayload
} from '../index.ts'

export interface PayloadAndSubscription extends PayloadSubscription {
  created: CreatedPayload
}
