import type {SubscriptionCallbackParams} from './SubscriptionCallbackParams'

export type onPayloadEvent = (subscriptionCallback: SubscriptionCallbackParams) => unknown | Promise<unknown> | void
