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

  it('should post xApp Push', async () => {
    fetchMock.doMockOnce(JSON.stringify(jsonFixtures.Push.notification))

    expect(await Sdk.Push.notification(pushOrEventBody)).toMatchObject({
      pushed: true
    })
  })

  it('should post xApp Event', async () => {
    fetchMock.doMockOnce(JSON.stringify(jsonFixtures.Push.event))

    expect(await Sdk.Push.event(pushOrEventBody)).toMatchObject({
      pushed: true,
      uuid: expect.any(String)
    })
  })
})
