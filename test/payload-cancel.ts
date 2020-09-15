import jsonFixtures from './fixtures/xumm-api.json'
import * as jestFixtures from './fixtures/xumm-api'
import fetchMock from 'jest-fetch-mock'

fetchMock.enableMocks()

import {XummSdk, Types} from '../src/'

afterEach(() => fetchMock.dontMock())

describe('Cancel XUMM payloads', () => {
  process.env.XUMM_APIKEY = jsonFixtures.api.key
  process.env.XUMM_APISECRET = jsonFixtures.api.secret

  const Sdk = new XummSdk()

  it('should cancel a payload by UUID', async () => {
    fetchMock.doMockOnce(JSON.stringify(jsonFixtures.payload.get))
    fetchMock.doMockOnce(JSON.stringify(jsonFixtures.payload.cancelled))

    const cancelled = await Sdk.payload.cancel('00000000-0000-4839-af2f-f794874a80b0')

    expect(cancelled).toMatchObject(jestFixtures.cancelPayloadResponseObject)
  })

  it('should return numm if payload not found', async () => {
    fetchMock.doMockOnce(JSON.stringify(jsonFixtures.payload.get))
    fetchMock.doMockOnce(JSON.stringify(jsonFixtures.payload.notfound))

    expect(await Sdk.payload.cancel('00000000-0000-4839-af2f-f794874a80b0')).toBeNull()
  })

  it('should throw if payload not found with `returnErrors`', async () => {
    fetchMock.doMockOnce(JSON.stringify(jsonFixtures.payload.get))
    fetchMock.doMockOnce(JSON.stringify(jsonFixtures.payload.notfound))

    const failed = Sdk.payload.cancel('00000000-0000-4839-af2f-f794874a80b0', true)

    const e = jsonFixtures.payload.notfound.error
    const err = new Error(`Error code ${e.code}, see XUMM Dev Console, reference: ${e.reference}`)

    expect(failed).rejects.toThrow(err)
  })

  it('should cancel a payload by Created Payload', async () => {
    fetchMock.doMockOnce(JSON.stringify(jsonFixtures.payload.created))

    const payload = jestFixtures.validPayload as Types.XummPostPayloadBodyJson
    const createdPayload = await Sdk.payload.create(payload)

    expect(createdPayload).not.toBeNull()

    if (createdPayload) {
      fetchMock.doMockOnce(JSON.stringify(jsonFixtures.payload.get))
      fetchMock.doMockOnce(JSON.stringify(jsonFixtures.payload.cancelled))

      const cancelled = await Sdk.payload.cancel(createdPayload)

      expect(cancelled).toMatchObject(jestFixtures.cancelPayloadResponseObject)
    }
  })


  it('should cancel a payload by Fetched Payload', async () => {
    fetchMock.doMockOnce(JSON.stringify(jsonFixtures.payload.get))

    const getPayload = await Sdk.payload.get('00000000-0000-4839-af2f-f794874a80b0')

    expect(getPayload).not.toBeNull()

    if (getPayload) {
      fetchMock.doMockOnce(JSON.stringify(jsonFixtures.payload.cancelled))
      expect(await Sdk.payload.cancel(getPayload)).toMatchObject(jestFixtures.cancelPayloadResponseObject)
    }
  })
})
