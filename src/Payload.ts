import Debug from 'debug'
import {Meta} from './Meta'

import type {
  XummPostPayloadBodyJson as JsonPayload,
  XummPostPayloadBodyBlob as BlobPayload,
  XummPostPayloadResponse as CreatedPayload,
  XummApiError as ApiError,
  XummGetPayloadResponse as XummPayload
} from './types/xumm-api'

interface FatalApiError {
  error: boolean
  message: string
  reference?: string
  code: number
  req?: string
  method?: string
}

const log = Debug('xumm-sdk:payload')

export class Payload {
  private Meta: Meta

  constructor (MetaObject: Meta) {
    log('Constructed')

    this.Meta = MetaObject
  }

  throwIfError(call: unknown): Error | void {
    const isFatalError = (call as unknown as FatalApiError).message !== undefined
    if (isFatalError) {
      throw new Error((call as unknown as FatalApiError).message)
    }
    const isError = (call as unknown as CreatedPayload).next === undefined &&
      (call as unknown as ApiError)?.error?.code !== undefined
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

  async create (payload: JsonPayload | BlobPayload): Promise<CreatedPayload> {
    const call = await this.Meta.call<CreatedPayload>('payload', 'POST', payload)
    this.throwIfError(call as unknown)
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

