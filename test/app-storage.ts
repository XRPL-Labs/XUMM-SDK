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

  it('should set app storage', async () => {
    fetchMock.doMockOnce(JSON.stringify(jsonFixtures.storage.setResponse))

    expect(await Sdk.storage.set({name: 'Wietse'})).toBeTruthy()
  })

  it('should get app storage', async () => {
    fetchMock.doMockOnce(JSON.stringify(jsonFixtures.storage.getResponse))

    expect(await Sdk.storage.get()).toMatchObject({some: 'other_data'})
  })

  it('should clear app storage', async () => {
    fetchMock.doMockOnce(JSON.stringify(jsonFixtures.storage.deleteResponse))

    expect(await Sdk.storage.delete()).toBeTruthy()
  })

  it('should throw on invalid credentials: set app storage', () => {
    fetchMock.doMockOnce(JSON.stringify(jsonFixtures.invalidCredentials))

    const e = jsonFixtures.invalidCredentials.error
    const err = new Error(`Error code ${e.code}, see XUMM Dev Console, reference: ${e.reference}`)

    expect(Sdk.storage.set({name: 'Wietse'})).rejects.toThrow(err)
  })

  it('should throw on invalid credentials: get app storage', () => {
    fetchMock.doMockOnce(JSON.stringify(jsonFixtures.invalidCredentials))

    const e = jsonFixtures.invalidCredentials.error
    const err = new Error(`Error code ${e.code}, see XUMM Dev Console, reference: ${e.reference}`)

    expect(Sdk.storage.get()).rejects.toThrow(err)
  })

  it('should throw on invalid credentials: clear app storage', () => {
    fetchMock.doMockOnce(JSON.stringify(jsonFixtures.invalidCredentials))


    const e = jsonFixtures.invalidCredentials.error
    const err = new Error(`Error code ${e.code}, see XUMM Dev Console, reference: ${e.reference}`)

    expect(Sdk.storage.delete()).rejects.toThrow(err)
  })
})
