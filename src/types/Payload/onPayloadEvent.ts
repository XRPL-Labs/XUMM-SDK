import type {SubscriptionCallbackParams} from './SubscriptionCallbackParams'

export type onPayloadEvent = (subscriptionCallback: SubscriptionCallbackParams) => any | Promise<any> | void
