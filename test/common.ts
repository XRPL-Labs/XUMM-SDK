import jsonFixtures from './fixtures/xumm-api.json'
import * as jestFixtures from './fixtures/xumm-api'
import fetchMock from 'jest-fetch-mock'

fetchMock.enableMocks()

/**
 * Note to self: optional headers
 */

// fetchMock.mockResponseOnce(someJSON, {
//   headers: {'content-type': 'application/json; charset=utf-8'},
//   status: 403,
//   statusText: 'Forbidden'
// })

import {XummSdk} from '../src/'

afterEach(() => fetchMock.dontMock())

describe('Common XUMM API client tests', () => {
  it('should construct based on dotenv', () => {
    process.env.XUMM_APIKEY = jsonFixtures.api.key
    process.env.XUMM_APISECRET = jsonFixtures.api.secret

    expect(() => {
      const Sdk = new XummSdk()
    }).not.toThrowError()
  })

  it('should construct based on provided api key & secret', () => {
    expect(() => {
      const Sdk = new XummSdk(jsonFixtures.api.key, jsonFixtures.api.secret)
    }).not.toThrowError()
  })

  it('should get error results on invalid api key / secret', () => {
    expect(() => {
      const Sdk = new XummSdk('xxxxxx', 'yyyyyyy')
    }).toThrowError('Invalid API Key and/or API Secret. Use dotenv or constructor params.')
  })

  it('should get app name on valid credentials', async () => {
    fetchMock.doMockOnce(JSON.stringify(jsonFixtures.ping.pong))

    const Sdk = new XummSdk(jsonFixtures.api.key, jsonFixtures.api.secret)
    expect(await Sdk.ping()).toMatchObject(jestFixtures.pongObject)
  })

  it('should get auth error on invalid credentials', () => {
    fetchMock.doMockOnce(JSON.stringify(jsonFixtures.invalidCredentials))

    const e = jsonFixtures.invalidCredentials.error
    const err = new Error(`Error code ${e.code}, see XUMM Dev Console, reference: ${e.reference}`)

    expect((new XummSdk(jsonFixtures.api.key, jsonFixtures.api.secret)).ping()).rejects.toThrow(err)
  })

  /**
   * Tests done
   */
})
