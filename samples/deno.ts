import {debug as Debug} from 'https://deno.land/x/debug/mod.ts'
import {XummSdk} from '../mod.ts'
import type {XummTypes} from '../mod.ts'

const log = Debug('xumm-sdk:sample')

// Add API key & secret to constructor, or use dotenv

const Sdk = new XummSdk()
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
