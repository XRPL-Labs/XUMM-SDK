import type {SubscriptionCallbackParams} from './SubscriptionCallbackParams.ts'

export type onPayloadEvent = (subscriptionCallback: SubscriptionCallbackParams) => unknown | Promise<unknown> | void
