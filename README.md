# XUMM SDK (JS/TS)  [![npm version](https://badge.fury.io/js/xumm-sdk.svg)](https://www.npmjs.com/xumm-sdk)

Interact with the XUMM SDK from Javascript / Typescript environments.

## How to use the XUMM SDK

Get the SDK straight from npm: `npm install xumm-sdk`.

Initialize the SDK in Javascript:
```javascript
const {XummSdk} = require('xumm-sdk')
```

... or in Typescript:

```typescript
import {XummSdk} from 'xumm-sdk'
// Or with types:
//   import {XummSdk, Types} from 'xumm-sdk'
```

Now continue by constructing the XummSdk object:

```typescript
const Sdk = new XummSdk()
// Or with manually provided credentials (instead of using dotenv):
//   const Sdk = new XummSdk('someAppKey', 'someAppSecret')
```

### Credentials

The SDK will look in your environment or dotenv file (`.env`) for the `XUMM_APIKEY` and `XUMM_APISECRET` values.
A [sample dotenv file looks like this](https://github.com/XRPL-Labs/XUMM-SDK/blob/master/sample.env). Alternatively
you can provide your XUMM API Key & Secret by passing them to the XummSdk constructor. If both your environment and the SDK constructor contain credentials, the values provided to the constructor will be used.

Create your app and get your XUMM API credentials at the XUMM Developer Console:

- https://apps.xumm.dev

More information about the XUMM API, payloads, the API workflow, sending Push notifications, etc. please check the XUMM API Docs: 

- https://xumm.readme.io/docs


### Methods & params (+ samples)

After constructing the SDK, you can call the methods:

- `Sdk.*` for the helper methods (see below)
- `Sdk.payload.*` to get/update/create payloads for users to sign
- `Sdk.storage.*` for your XUMM app storage (to store meta info for headless applications)

Please note all snippets below assume you constructed the XUMM SDK into the `Sdk` constant, as the [How to use the XUMM SDK](#how-to-use-the-xumm-sdk) section outlines.

#### Helper methods

##### Sdk.ping()

The `ping` method allows you to verify API access (valid credentials) and returns some info on your XUMM APP:

```typescript
const pong = await Sdk.ping()
```

Returns [`<ApplicationDetails>`](https://github.com/XRPL-Labs/XUMM-SDK/blob/master/src/types/Meta/ApplicationDetails.ts):
```javascript
{
  quota: {},
  application: {
    uuidv4: '00000000-1111-2222-3333-aaaaaaaaaaaa',
    name: 'My XUMM APP',
    webhookurl: '',
    disabled: 0
  },
  call: { uuidv4: 'bbbbbbbb-cccc-dddd-eeee-111111111111' }
}
```

##### Sdk.getCuratedAssets()

The `getCuratedAssets` method allows you to get the list of trusted issuers and IOU's. This is the same list used to
populate the "Add Asset" button at the XUMM home screan.

```typescript
const curatedAssets = await Sdk.getCuratedAssets()
```

Returns [`<CuratedAssetsResponse>`](https://github.com/XRPL-Labs/XUMM-SDK/blob/master/src/types/Meta/CuratedAssetsResponse.ts):
```javascript
{
  curatedAssets: {
    issuers: [ 'Bitstamp', 'GateHub' ],
    currencies: [ 'USD', 'BTC', 'EUR', 'ETH' ],
    details: {
      Bitstamp: [Object],
      GateHub: [Object]
    }
  }
}
```

#### App Storage

App Storage allows you to store a JSON object at the XUMM API platform, containing max 60KB of data.
Your XUMM APP storage is stored at the XUMM API backend, meaning it persists until you overwrite or delete it.

This data is private, and accessible only with your own API credentials. This private JSON data can be used to store credentials / config / bootstrap info / ... for your headless application (eg. POS device).

```typescript
const storageSet = await Sdk.storage.set({name: 'Wietse', age: 32, male: true})
console.log(storageSet)
// true

const storageGet = await Sdk.storage.get()
console.log(storageGet)
// { name: 'Wietse', age: 32, male: true }

const storageDelete = await Sdk.storage.delete()
console.log(storageDelete)
// true

const storageGetAfterDelete = await Sdk.storage.get()
console.log(storageGetAfterDelete)
// null
```

#### Payloads

...
TODO

#### Payload subscriptions (subscribe to live updates)

...
TODO

## Debugging (logging)

The XUMM SDK will emit debugging info when invoked with a debug environment variable configured like: `DEBUG=xumm-sdk*` 

You'll see the XUMM SDK debug messages if you invoke your script instead of this:

```
node myApp.js
```

like this:

```
DEBUG=xumm-sdk* node myApp.js
```

## Development

Please note: you most likely just want to **use** the XUMM SDK, to do so, fetch the `xumm-sdk` package from NPM using `npm install --save xumm-sdk`.

If you actually want to change/test/develop/build/contribute (to) the source of the XUMM SDK:

##### Build

Please note: at least Typescript version **3.8+** is required!

To build the code, run `tsc`. To build automatically on file changes (watch): `tsc -w`.

##### Lint & test

Lint the code using `npm run lint`, run tests (jest) using `npm run test`

##### Run development code:

Build, run, show debug output & watch `/dist/samples/dev.js`, compiled from `/samples/dev.ts` using `npm run dev`. The `/samples/dev.ts` file is **not included by default**. A sample file could contain:

```typescript
import Debug from 'debug'
import {XummSdk, Types} from '../src/'

const log = Debug('xumm-sdk:sample')

const main = async () => {
  try {
    const Sdk = new XummSdk('someAppKey', 'someAppSecret')
    const pong = await Sdk.ping()
    log({pong})

    const curatedAssets = await Sdk.getCuratedAssets()
    log({curatedAssets})

    const PaymentPayload: Types.CreatePayload = {
      txjson: {
        TransactionType : 'Payment',
        Destination : 'rPEPPER7kfTD9w2To4CQk6UCfuHM9c6GDY',
        DestinationTag: 495,
        Amount: '1337'
      }
    }

    const payload = await Sdk.payload.create(PaymentPayload)
    log({payload})

    if (payload) {
      await Sdk.payload.subscribe(payload, event => {
        log('Subscription Event data', event.data)

        if (typeof event.data.expired !== 'undefined' || typeof event.data.signed !== 'undefined') {
          return event.data
        }
      })
    }
  } catch (e) {
    log({error: e.message, stack: e.stack})
  }
}

main()
```
