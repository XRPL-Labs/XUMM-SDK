import jsonFixtures from './fixtures/xumm-api.json'
import * as jestFixtures from './fixtures/xumm-api'
import fetchMock from 'jest-fetch-mock'

fetchMock.enableMocks()

import {XummSdk, XummTypes} from '../src/'

afterEach(() => fetchMock.dontMock())

describe('Get XUMM payloads', () => {
  process.env.XUMM_APIKEY = jsonFixtures.api.key
  process.env.XUMM_APISECRET = jsonFixtures.api.secret

  const Sdk = new XummSdk()

  it('should get a payload by UUID', async () => {
    fetchMock.doMockOnce(JSON.stringify(jsonFixtures.payload.get))

    const payload = await Sdk.payload.get('00000000-0000-4839-af2f-f794874a80b0')

    expect(payload).toMatchObject(jsonFixtures.payload.get)
  })

  it('should get a payload by Created Payload', async () => {
    fetchMock.doMockOnce(JSON.stringify(jsonFixtures.payload.created))

    const payload = jestFixtures.validPayload as XummTypes.XummPostPayloadBodyJson
    const createdPayload = await Sdk.payload.create(payload)

    expect(createdPayload).not.toBeNull()

    if (createdPayload) {
      fetchMock.doMockOnce(JSON.stringify(jsonFixtures.payload.get))

      expect(await Sdk.payload.get(createdPayload)).toMatchObject(jsonFixtures.payload.get)
    }
  })

  it('should null on getting an invalid/non existent payload', async () => {
    fetchMock.doMockOnce(JSON.stringify(jsonFixtures.payload.error))

    const payload = await Sdk.payload.get('00000000-0000-4839-af2f-f794874a80b0')

    expect(payload).toBeNull()

  })

  it('should throw on getting an invalid/non existent payload with `returnErrors`', async () => {
    fetchMock.doMockOnce(JSON.stringify(jsonFixtures.payload.notfound))

    const failed = Sdk.payload.get('00000000-0000-4839-af2f-f794874a80b0', true)

    const e = jsonFixtures.payload.notfound.error
    const err = new Error(`Error code ${e.code}, see XUMM Dev Console, reference: ${e.reference}`)

    expect(failed).rejects.toThrow(err)
  })
})
