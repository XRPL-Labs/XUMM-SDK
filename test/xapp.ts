import jsonFixtures from './fixtures/xumm-api.json'
import * as jestFixtures from './fixtures/xumm-api'
import fetchMock from 'jest-fetch-mock'

fetchMock.enableMocks()

import {XummSdk} from '../src/'

afterEach(() => fetchMock.dontMock())

describe('Interact with App storage (meta)', () => {
  process.env.XUMM_APIKEY = jsonFixtures.api.key
  process.env.XUMM_APISECRET = jsonFixtures.api.secret

  const Sdk = new XummSdk()

  it('should fetch OTT data', async () => {
    fetchMock.doMockOnce(JSON.stringify(jsonFixtures.xApp.get))
    const ott = 'd7a0dd9e-a757-4b77-afd1-9970eb54e54d'
    expect(await Sdk.xApp.get(ott)).toMatchObject({
      account: expect.any(String),
      accountaccess: expect.any(String),
      accounttype: expect.any(String),
      locale: expect.any(String),
      style: expect.any(String),
      version: expect.any(String)
    })
  })
})
