import Debug from 'debug'
import fetch from 'node-fetch'
import {hostname} from 'os'
import packageJson from '../package.json'
import {throwIfError} from './utils'

const log = Debug('xumm-sdk:main')

export interface ApplicationDetails {
  quota: object
  application: {
    uuidv4: string
    name: string
    webhookurl: string
    disabled: number
  },
  call: {
    uuidv4: string
  }
}

export interface Pong {
  pong: boolean
  auth: ApplicationDetails
}

export interface AnyJson {
  [key: string]: AnyJson | any
}

export interface CuratedAssetsResponse {
  issuers: string[]
  currencies: string[]
  details: {
    [issuer: string]: {
      id: number
      name: string
      domain?: string
      avatar?: string
      shortlist: number
      currencies: {
        [currencyCode: string]: {
          id: number
          issuer_id: number
          currency: string
          name: string
          avatar?: string
          shortlist: number
        }
      }
    }
  }
}

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

  public async call<T> (endpoint: string, httpMethod: string = 'GET', data?: AnyJson | string): Promise<T> {
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
        'User-Agent': `xumm-sdk/${packageJson.version} (${hostname()}) node-fetch`,
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
