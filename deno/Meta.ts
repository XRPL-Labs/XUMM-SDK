import {debug as Debug} from 'https://deno.land/x/debug/mod.ts'
import {throwIfError} from './utils.ts'

import type {
  ApplicationDetails,
  Pong,
  CreatePayload,
  AnyJson,
  CuratedAssetsResponse
} from './types/index.ts'

const log = Debug('xumm-sdk:meta')

export class Meta {
  private apiKey: string
  private apiSecret: string

  constructor (apiKey: string, apiSecret: string) {
    log('Constructed')

    const uuidRe = new RegExp('^[a-f0-9]{8}\-[a-f0-9]{4}\-[a-f0-9]{4}\-[a-f0-9]{4}\-[a-f0-9]{12}$')

    if (!uuidRe.test(apiKey) || !uuidRe.test(apiSecret)) {
      throw new Error('Invalid API Key and/or API Secret. Use dotenv or constructor params.')
    }

    this.apiKey = apiKey
    this.apiSecret = apiSecret

    return this
  }

  public async call<T> (endpoint: string, httpMethod = 'GET', data?: CreatePayload | AnyJson): Promise<T> {
    const method = httpMethod.toUpperCase()

    try {
      let body
      if (typeof data !== 'undefined') {
        if (typeof data === 'object' && data !== null) {
          body = JSON.stringify(data)
        }
        if (typeof data === 'string') {
          body = data
        }
      }

      const headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'xumm-sdk/deno:0.1.6',
        'x-api-key': this.apiKey,
        'x-api-secret': this.apiSecret
      }

      const request = await fetch('https://xumm.app/api/v1/platform/' + endpoint, {
        method,
        body,
        headers
      })
      const json: T = await request.json()
      // log({json})
      return json
    } catch (e) {
      const err = new Error(`Unexpected response from XUMM API [${method}:${endpoint}]`)
      err.stack = e.stack || undefined
      throw err
    }
  }

  public async ping (): Promise<ApplicationDetails> {
    const pong = await this.call<Pong>('ping')

    throwIfError(pong)

    if (typeof pong.auth !== 'undefined') {
      return pong.auth
    }

    throw new Error(`Unexpected response for ping request`)
  }

  async getCuratedAssets (): Promise<CuratedAssetsResponse> {
    return await this.call<CuratedAssetsResponse>('curated-assets')
  }
}
