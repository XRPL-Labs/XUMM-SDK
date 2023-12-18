import {debug as Debug} from 'debug'
import type {Meta} from './Meta'
import {w3cwebsocket as WebSocket, ICloseEvent as WsCloseEvent, IMessageEvent as WsMessageEvent} from 'websocket'

import type {
  AnyJson,
  PayloadSubscription,
  PayloadAndSubscription,
  onPayloadEvent,
  XummJsonTransaction,
  XummPostPayloadBodyJson,
  XummPostPayloadBodyBlob,
  CreatedPayload,
  DeletedPayload,
  XummPayload
} from './types'

import {
  throwIfError,
  DeferredPromise
} from './utils'

const log = Debug('xumm-sdk:payload')
const logWs = Debug('xumm-sdk:payload:websocket')

const maxSocketConnectAttempts = 30
const socketConnectAttemptSecondsDelay = 2
const socketKeepaliveSendSeconds = 2
const socketKeepaliveTimeoutSeconds = 10

export class Payload {
  private Meta: Meta

  constructor (MetaObject: Meta) {
    log('Constructed')

    this.Meta = MetaObject
  }

  async resolvePayload(payload: string | XummPayload | CreatedPayload): Promise<XummPayload | null> {
    if (typeof payload === 'string') {
      return await this.get(payload, true)
    } else if (typeof (payload as CreatedPayload)?.uuid !== 'undefined') {
      return await this.get((payload as CreatedPayload).uuid, true)
    } else if (typeof (payload as XummPayload)?.meta?.uuid !== 'undefined') {
      return (payload as XummPayload)
    }

    throw new Error('Could not resolve payload (not found)')
  }

  async create (
    payload: XummPostPayloadBodyJson | XummPostPayloadBodyBlob | XummJsonTransaction,
    returnErrors = false
  ): Promise<CreatedPayload | null> {
    const directTx = typeof (payload as XummJsonTransaction).TransactionType !== 'undefined'
      && typeof (payload as XummPostPayloadBodyJson).txjson === 'undefined'

    const call = await this.Meta.call<CreatedPayload>('payload', 'POST', directTx ? {txjson: payload} : payload)
    if (returnErrors) {
      throwIfError(call)
    }

    const isCreatedPayload = (call as unknown as CreatedPayload)?.next !== undefined
    if (!isCreatedPayload) {
      return null
    }

    return call
  }

  async get (payload: string | CreatedPayload, returnErrors = false): Promise<XummPayload | null> {
    const payloadUuid = typeof payload === 'string'
     ? payload
     : payload?.uuid

    const call = await this.Meta.call<XummPayload>('payload/' + payloadUuid, 'GET')

    if (returnErrors) {
      throwIfError(call)
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
      const _u = 'undefined' // For globalThis.mockedWebSocket (leave note for Deno gen!)

      let socket: WebSocket
      let keepAlivePing: ReturnType<typeof setInterval>
      let keepAliveReinstateTimer: ReturnType<typeof setTimeout>
      let reconnectAttempts = 0

      callbackPromise.promise.then(() => {
        clearTimeout(keepAlivePing)
        clearTimeout(keepAliveReinstateTimer)
        socket.close()
      })

      const connect = () => {
        socket = typeof (globalThis as any)?.MockedWebSocket !== _u && typeof jest !== _u
          ? new ((globalThis as any)?.MockedWebSocket)('ws://xumm.local')
          : new WebSocket(this.Meta.endpoint.replace(/^http/, 'ws') + '/sign/' + payloadDetails.meta.uuid)

        socket.onopen = () => {
          console.log(`Payload ${payloadDetails.meta.uuid}: subscription active (WebSocket opened)`)

          keepAlivePing = setInterval(() => {
            logWs('Send keepalive')
            socket.send('{"ping":true}')
          }, socketKeepaliveSendSeconds * 1000)
        }

        socket.onmessage = async (MessageEvent: WsMessageEvent) => {
          reconnectAttempts = 0

          const m = MessageEvent.data
          let json: AnyJson | undefined = undefined

          try {
            json = JSON.parse(m.toString())

            if (json?.message && json.message === 'Right back at you!') {
              // Keepalive responses
              logWs('Keepalive response')
              clearTimeout(keepAliveReinstateTimer)
              keepAliveReinstateTimer = setTimeout(() => {
                console.log(
                  `WebSocket for ${payloadDetails.meta.uuid} ` +
                  `keepalive response timeout, assume dead... (Reconnect)`
                )
                socket.close(1002, 'Assume dead')
              }, socketKeepaliveTimeoutSeconds * 1000)
              return
            }

            if (json?.signed || json?.expired) {
              // The payload has been signed or expired, update the referenced payload
              const updatedPayloadDetails = await this.resolvePayload(payload)
              Object.assign(payloadDetails, {...updatedPayloadDetails})
            }
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
                async resolve (resolveData?: unknown) {
                  await callbackPromise.resolve(resolveData || undefined)
                },
                payload: payloadDetails
              })

              if (callbackResult !== undefined) {
                callbackPromise.resolve(callbackResult)
              }
            } catch (e) {
              // Do nothing
              logWs(`Payload ${payloadDetails.meta.uuid}: Callback exception`, e)
              // This one emit for devs to know about this problem
              console.log(`Payload ${payloadDetails.meta.uuid}: Callback exception: ${(e as Error).message}`)
            }
          }
        }

        socket.onclose = (_e: WsCloseEvent) => {
          logWs('Closed [code]', _e.code)
          logWs('Closed [reason]', _e.reason)
          logWs('Closed [wasClean]', _e.wasClean)

          clearInterval(keepAlivePing)
          clearTimeout(keepAliveReinstateTimer)

          // Reconnect
          if (_e.code > 1000 || _e.wasClean === false) {
            logWs('Unhealthy disconnect, reconnecting...', _e.code)
            if (reconnectAttempts < maxSocketConnectAttempts) {
              if (reconnectAttempts === 0) {
                console.log(`WebSocket for ${payloadDetails.meta.uuid} lost, reconnecting...`)
              }
              setTimeout(() => {
                reconnectAttempts++
                logWs('# Reconnect')
                socket = connect()
              }, socketConnectAttemptSecondsDelay * 1000)
            } else {
              console.log(`WebSocket for ${payloadDetails.meta.uuid} exceeded reconnect timeouts, give up`)
            }
          } else {
            // Socket closed on purpose (?)
          }

          logWs(`Payload ${payloadDetails.meta.uuid}: Subscription ended (WebSocket closed)`)
        }

        return socket
      }

      socket = connect()

      return {
        payload: payloadDetails,
        resolve (resolveData?: unknown) {
          callbackPromise.resolve(resolveData || undefined)
        },
        resolved: callbackPromise.promise,
        websocket: socket
      }
    }

    throwIfError(payloadDetails)

    throw Error(`Couldn't subscribe: couldn't fetch payload`)
  }

  async cancel (
    payload: string | XummPayload | CreatedPayload,
    returnErrors = false
  ): Promise<DeletedPayload | null> {
    const fullPayload = await this.resolvePayload(payload)

    const call = await this.Meta.call<DeletedPayload>('payload/' + fullPayload?.meta?.uuid, 'DELETE')
    if (returnErrors) {
      throwIfError(call)
    }

    const isValidResponse = (call as unknown as DeletedPayload)?.meta?.uuid !== undefined
    if (!isValidResponse) {
      return null
    }

    return call
  }

  async createAndSubscribe (
    payload: XummPostPayloadBodyJson | XummPostPayloadBodyBlob | XummJsonTransaction,
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
   * TODO: add xrplcluster.com helper WebSocket client to verify payload result tx hash
   * on ledger.
   */

  // async getPayloadXrplTx (payload: string | XummPayload | CreatedPayload): Promise<AnyJson | null> {
  //   // TODO
  // }

}
