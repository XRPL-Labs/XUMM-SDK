import type {
  PayloadSubscription,
  XummPostPayloadResponse as CreatedPayload
} from '../'

export interface PayloadAndSubscription extends PayloadSubscription {
  created: CreatedPayload
}
