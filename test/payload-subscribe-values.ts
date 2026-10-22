import {Payload} from '../src/Payload'
import type {Meta} from '../src/Meta'
import type {XummPayload} from '../src/types'
import jsonFixtures from './fixtures/xumm-api.json'

class TestWebSocket {
  close = jest.fn()
  onopen?: () => void
  onmessage?: (event: {data: string}) => Promise<void>
  onclose?: () => void
}

beforeAll(() => Object.assign(global, {MockedWebSocket: TestWebSocket}))
afterAll(() => delete (global as any).MockedWebSocket)

describe('Payload subscription resolution values', () => {
  const values = [false, 0, '', null, undefined, {signed: false}]

  it.each(values)('preserves external resolve value %p', async value => {
    const payload = new Payload({endpoint: 'https://xumm.app'} as Meta)
    const subscription = await payload.subscribe((jsonFixtures.payload.get as unknown as XummPayload))
    subscription.resolve(value)
    expect(await subscription.resolved).toBe(value)
    expect(subscription.websocket.close).toHaveBeenCalledWith(1000)
  })

  it.each(values)('preserves callback resolve value %p', async value => {
    const payload = new Payload({endpoint: 'https://xumm.app'} as Meta)
    const subscription = await payload.subscribe((jsonFixtures.payload.get as unknown as XummPayload), event => {
      event.resolve(value)
    })
    await subscription.websocket.onmessage!({data: '{"opened":true}'} as any)
    expect(await subscription.resolved).toBe(value)
  })
})
