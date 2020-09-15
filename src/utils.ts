import type {
  XummPostPayloadResponse as CreatedPayload,
  XummApiError as ApiError,
  XummGetPayloadResponse as XummPayload
} from './types/xumm-api'

import type {StorageResponse} from './Storage'

export interface FatalApiError {
  error: boolean
  message: string
  reference?: string
  code: number
  req?: string
  method?: string
}

export function throwIfError(call: unknown): Error | void {
  const isFatalError = (call as unknown as FatalApiError).message !== undefined
  if (isFatalError) {
    throw new Error((call as unknown as FatalApiError).message)
  }

  const isError = (call as unknown as CreatedPayload).next === undefined
    && (call as unknown as XummPayload)?.meta?.uuid === undefined
    && (call as unknown as StorageResponse)?.application?.uuidv4 === undefined
    && (call as unknown as ApiError)?.error?.code !== undefined

  if (isError) {
    const e = (call as unknown as ApiError).error
    /**
     * TODO:
     *   add local error code list + descriptions?
     *   (note: can be endpoint specific,)
     */
    throw new Error(`Error code ${e.code}, see XUMM Dev Console, reference: ${e.reference}`)
  }
}

export class DeferredPromise {
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
