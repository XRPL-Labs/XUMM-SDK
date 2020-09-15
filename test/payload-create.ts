import jsonFixtures from './fixtures/xumm-api.json'
import * as jestFixtures from './fixtures/xumm-api'
import fetchMock from 'jest-fetch-mock'

fetchMock.enableMocks()

import {XummSdk, Types} from '../src/'

afterEach(() => fetchMock.dontMock())

describe('Create XUMM payloads', () => {
  process.env.XUMM_APIKEY = jsonFixtures.api.key
  process.env.XUMM_APISECRET = jsonFixtures.api.secret

  const Sdk = new XummSdk()

  it('should create a simple payment', async () => {
    fetchMock.doMockOnce(JSON.stringify(jsonFixtures.payload.created))

    const payload = jestFixtures.validPayload as Types.XummPostPayloadBodyJson
    const createdPayload = await Sdk.payload.create(payload)

    expect(createdPayload).toMatchObject(jestFixtures.createPayloadResponseObject)
  })

  it('should return null on invalid payload', async () => {
    fetchMock.doMockOnce(JSON.stringify(jsonFixtures.payload.error))

    const failed = await Sdk.payload.create(jestFixtures.invalidPayload as Types.XummPostPayloadBodyJson)

    expect(failed).toBeNull()
  })

  it('should throw on invalid payload with `returnErrors`', async () => {
    fetchMock.doMockOnce(JSON.stringify(jsonFixtures.payload.error))

    const failed = Sdk.payload.create(jestFixtures.invalidPayload as Types.XummPostPayloadBodyJson, true)

    const e = jsonFixtures.payload.error.error
    const err = new Error(`Error code ${e.code}, see XUMM Dev Console, reference: ${e.reference}`)

    expect(failed).rejects.toThrow(err)
  })
})
