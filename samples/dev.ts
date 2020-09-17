import {debug as Debug} from 'https://deno.land/x/debug/mod.ts'
import {XummSdk, XummTypes} from '../src/index.ts'

const log = Debug('xumm-sdk:sample')

// Get keys from https://apps.xumm.dev
const Sdk = new XummSdk('someApiKey', 'someApiSecret')
const pong = await Sdk.ping()
log('pong', {pong})

const curatedAssets = await Sdk.getCuratedAssets()
log('curatedAssets', {curatedAssets})

const PaymentPayload: XummTypes.CreatePayload = {
  txjson: {
    TransactionType : 'Payment',
    Destination : 'rPEPPER7kfTD9w2To4CQk6UCfuHM9c6GDY',
    DestinationTag: 495,
    Amount: '1337'
  }
}

const payload = await Sdk.payload.create(PaymentPayload)
log('payload', {payload})

if (payload) {
  await Sdk.payload.subscribe(payload, event => {
    log('Subscription Event data', event.data)

    if (typeof event.data.expired !== 'undefined' || typeof event.data.signed !== 'undefined') {
      return event.data
    }
  })
}
