import Debug from 'debug'
import {Meta, AnyJson} from './Meta'
import WebSocket from 'ws'

import type {
  XummPostPayloadBodyJson as JsonPayload,
  XummPostPayloadBodyBlob as BlobPayload,
  XummPostPayloadResponse as CreatedPayload,
  XummDeletePayloadResponse as DeletedPayload,
  XummApiError as ApiError,
  XummGetPayloadResponse as XummPayload
} from './types/xumm-api'

const log = Debug('xumm-sdk:payload')
const logWs = log.extend('websocket')

interface FatalApiError {
  error: boolean
  message: string
  reference?: string
  code: number
  req?: string
  method?: string
}

interface SubscriptionCallbackParams {
  uuid: string
  data: AnyJson
  resolve: (resolveData?: any) => void,
  payload: XummPayload
}

interface PayloadSubscription {
  payload: XummPayload,
  resolved: Promise<any> | undefined
  resolve: (resolveData?: any) => void
  websocket: WebSocket,
}

interface PayloadAndSubscription extends PayloadSubscription {
  created: CreatedPayload
}

class DeferredPromise {
  private resolveFn: (arg?: any) => void = (arg?: any) => {
    // Will be replaced by Promise fn
  }
  private rejectFn: (arg?: any) => void = (arg?: any) => {
    // Will be replaced by Promise fn
  }

  public promise: Promise<any>

  constructor () {
    this.promise = new Promise((resolve, reject) => {
      this.resolveFn = resolve
      this.rejectFn = reject
    })
  }

  resolve (arg?: any) {
    this.resolveFn(arg)
    return this.promise
  }
  reject (arg?: any) {
    this.rejectFn(arg)
    return this.promise
  }
}

type onPayloadEvent = (subscriptionCallback: SubscriptionCallbackParams) => any | Promise<any> | void

export class Payload {
  private Meta: Meta

  constructor (MetaObject: Meta) {
    log('Constructed')

    this.Meta = MetaObject
  }

  async resolvePayload(payload: string | XummPayload | CreatedPayload): Promise<XummPayload | null> {
    let r = null

    if (typeof payload === 'string') {
      r = await this.get(payload)
    } else if (typeof (payload as CreatedPayload)?.uuid !== 'undefined') {
      r = await this.get((payload as CreatedPayload).uuid)
    } else if (typeof (payload as XummPayload)?.meta?.uuid !== 'undefined') {
      r = (payload as XummPayload)
    }

    return r
  }

  throwIfError(call: unknown): Error | void {
    const isFatalError = (call as unknown as FatalApiError).message !== undefined
    if (isFatalError) {
      throw new Error((call as unknown as FatalApiError).message)
    }

    const isError = (call as unknown as CreatedPayload).next === undefined
      && (call as unknown as XummPayload)?.meta?.uuid === undefined
      && (call as unknown as ApiError)?.error?.code !== undefined

    if (isError) {
      const e = (call as unknown as ApiError).error
      /**
       * TODO:
       *   add local error code list + descriptions?
       *   (note: can be endpoint specific,)
       */
      throw new Error(`Error ${e.code}, see XUMM Dev Console, ref# ${e.reference}`)
    }
  }

  async create (payload: JsonPayload | BlobPayload, returnErrors: boolean = false): Promise<CreatedPayload | null> {
    const call = await this.Meta.call<CreatedPayload>('payload', 'POST', payload)
    if (returnErrors) {
      this.throwIfError(call as unknown)
    }
    const isCreatedPayload = (call as unknown as CreatedPayload)?.next !== undefined
    if (!isCreatedPayload) {
      return null
    }
    return call
  }

  async get (payload: string, returnErrors: boolean = false): Promise<XummPayload | null> {
    const call = await this.Meta.call<XummPayload>('payload/' + payload, 'GET')
    if (returnErrors) {
      this.throwIfError(call as unknown)
    }
    const isPayload = (call as unknown as XummPayload)?.meta?.uuid !== undefined
    if (!isPayload) {
      return null
    }
    return call
  }

  async subscribe (
    payload: string | XummPayload | CreatedPayload,
    callback?: onPayloadEvent
  ): Promise<PayloadSubscription> {
    const callbackPromise = new DeferredPromise()
    const payloadDetails = await this.resolvePayload(payload)

    if (payloadDetails) {
      const socket = await new WebSocket('wss://xumm.app/sign/' + payloadDetails.meta.uuid)

      callbackPromise.promise.then(() => {
        socket.close()
      })

      socket.on('open', () => {
        logWs(`Payload ${payloadDetails.meta.uuid}: Subscription active (WebSocket opened)`)
      })

      socket.on('message', async m => {
        let json: AnyJson | undefined = undefined

        try {
          json = JSON.parse(m.toString())
        } catch (e) {
          // Do nothing
          logWs(`Payload ${payloadDetails.meta.uuid}: Received message, unable to parse as JSON`, e)
        }

        if (json && callback && typeof json.devapp_fetched === 'undefined') {
          try {
            // log(`Payload ${payload}`, json)

            const callbackResult = await callback({
              uuid: payloadDetails.meta.uuid,
              data: json,
              async resolve (resolveData?: any) {
                callbackPromise.resolve(resolveData || undefined)
              },
              payload: payloadDetails
            })

            if (callbackResult !== undefined) {
              callbackPromise.resolve(callbackResult)
            }
          } catch (e) {
            // Do nothing
            logWs(`Payload ${payloadDetails.meta.uuid}: Callback exception`, e)
          }
        }
      })

      socket.on('close', e => {
        logWs(`Payload ${payloadDetails.meta.uuid}: Subscription ended (WebSocket closed)`)
      })

      return {
        payload: payloadDetails,
        resolve (resolveData?: any) {
          callbackPromise.resolve(resolveData || undefined)
        },
        resolved: callbackPromise.promise,
        websocket: socket
      }
    }

    this.throwIfError(payloadDetails)

    throw Error(`Couldn't subscribe: couldn't fetch payload`)
  }

  async cancel (
    payload: string | XummPayload | CreatedPayload,
    returnErrors: boolean = false
  ): Promise<DeletedPayload | null> {
    const fullPayload = await this.resolvePayload(payload)

    const call = await this.Meta.call<DeletedPayload>('payload/' + fullPayload?.meta?.uuid, 'DELETE')
    if (returnErrors) {
      this.throwIfError(call as unknown)
    }

    const isValidResponse = (call as unknown as DeletedPayload)?.meta?.uuid !== undefined
    if (!isValidResponse) {
      return null
    }

    return call
  }

  async createAndSubscribe (
    payload: JsonPayload | BlobPayload,
    callback?: onPayloadEvent
  ): Promise<PayloadAndSubscription> {
    const createdPayload = await this.create(payload, true)
    if (createdPayload) {
      const subscription = await this.subscribe(createdPayload, callback)
      return {
        created: createdPayload,
        ...subscription
      }
    }
    throw new Error(`Error creating payload or subscribing to created payload`)
  }

  /**
   * TODO: add xrpl.ws helper WebSocket client to verify payload result tx hash
   * on ledger.
   */

  // async getPayloadXrplTx (payload: string | XummPayload | CreatedPayload): Promise<AnyJson | null> {
  //   // TODO
  // }

}
