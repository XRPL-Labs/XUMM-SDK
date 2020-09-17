import type {SubscriptionCallbackParams} from './SubscriptionCallbackParams.ts'

export type onPayloadEvent = (subscriptionCallback: SubscriptionCallbackParams) => any | Promise<any> | void
