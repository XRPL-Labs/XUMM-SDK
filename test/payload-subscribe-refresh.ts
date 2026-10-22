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

describe('Payload subscription terminal state refresh', () => {
  for (const input of ['uuid', 'created', 'full']) {
    it.each([{signed: false}, {signed: true}, {expired: true}])(
      'refreshes before callback for ' + input + ' input on %p', async eventData => {
        const initial = JSON.parse(JSON.stringify(jsonFixtures.payload.get)) as XummPayload
        initial.meta.resolved = false
        initial.meta.signed = false
        initial.meta.expired = false
        const updated = JSON.parse(JSON.stringify(initial)) as XummPayload
        updated.meta.resolved = true
        updated.meta.signed = 'signed' in eventData ? eventData.signed! : false
        updated.meta.expired = 'expired' in eventData ? eventData.expired! : false
        const call = jest.fn().mockResolvedValueOnce(initial).mockResolvedValueOnce(updated)
        if (input === 'full') call.mockReset().mockResolvedValueOnce(updated)
        const payload = new Payload({endpoint: 'https://xumm.app', call} as unknown as Meta)
        const callback = jest.fn(event => { event.resolve(event.payload.meta.resolved) })
        const arg = input === 'uuid' ? initial.meta.uuid
          : input === 'created' ? {uuid: initial.meta.uuid} as any : initial
        const subscription = await payload.subscribe(arg, callback)
        await subscription.websocket.onmessage!({data: JSON.stringify(eventData)} as any)
        expect(await subscription.resolved).toBe(true)
        expect(subscription.payload.meta).toMatchObject(updated.meta)
        expect(call).toHaveBeenLastCalledWith('payload/' + initial.meta.uuid, 'GET')
      }
    )
  }
})
