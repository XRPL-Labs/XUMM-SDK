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

  const pushOrEventBody = {
    user_token: 'ec079824-b804-49be-b521-a9502bc306ae',
    subtitle: 'AML inquiry',
    body: 'Please provide deposit information',
    data: {
      tx: '901AB6028204AE3EDB4D919EFC0BF36A25F73975674DCCA3FC54AEA85D9F56A0',
      account: 'rwietsevLFg8XSmG3bEZzFein1g8RBqWDZ'
    }
  }

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

  it('should post xApp Push', async () => {
    fetchMock.doMockOnce(JSON.stringify(jsonFixtures.xApp.push))

    expect(await Sdk.xApp.push(pushOrEventBody)).toMatchObject({
      pushed: true
    })
  })

  it('should post xApp Event', async () => {
    fetchMock.doMockOnce(JSON.stringify(jsonFixtures.xApp.event))

    expect(await Sdk.xApp.event(pushOrEventBody)).toMatchObject({
      pushed: true,
      uuid: expect.any(String)
    })
  })
})
