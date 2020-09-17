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
//   import {XummSdk, XummTypes} from 'xumm-sdk'
```

Now continue by constructing the XummSdk object:

```typescript
const Sdk = new XummSdk()
// Or with manually provided credentials (instead of using dotenv):
//   const Sdk = new XummSdk('someAppKey', 'someAppSecret')
```

### Credentials

The SDK will look in your environment or dotenv file (`.env`) for the `XUMM_APIKEY` and `XUMM_APISECRET` values. A `.env.sample` file is provided in this repository. A [sample dotenv file looks like this](https://github.com/XRPL-Labs/XUMM-SDK/blob/master/sample.env). Alternatively you can provide your XUMM API Key & Secret by passing them to the XummSdk constructor. If both your environment and the SDK constructor contain credentials, the values provided to the constructor will be used.

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

##### Intro

Payloads are the primary reason for the XUMM API (thus this SDK) to exist. The [XUMM API Docs explain '**Payloads**'](https://xumm.readme.io/docs/introduction) like this:

>  An XRPL transaction "template" can be posted to the XUMM API. Your transaction tample to sign (so: your "sign request") will be persisted at the XUMM API backend. We now call it a  a **Payload**. XUMM app user(s) can open the Payload (sign request) by scanning a QR code, opening deeplink or receiving push notification and resolve (reject or sign) on their own device.

A payload can contain an XRPL transaction template. Some properties may be omitted, as they will be added by the XUMM app when a user signs a transaction. A simple payload may look like this:

```javascript
{
  txjson: {
    TransactionType : 'Payment',
    Destination : 'rwiETSee2wMz3SBnAG8hkMsCgvGy9LWbZ1',
    Amount: '1337'
  }
}
```

As you can see the payload looks like a regular XRPL transaction, wrapped in an `txjson` object, omitting the mandatory `Account`, `Fee` and `Sequence` properties. They will be added containing the correct values when the payload is signed by an app user.

Optionally (besides `txjson`) a payload can contain these properties ([TS definition](https://github.com/XRPL-Labs/XUMM-SDK/blob/d2aae98eb8f496f4d77079c777aa41df754d4ebc/src/types/xumm-api/index.ts#L79)):

- `options` to define payload options like a return URL, expiration, etc.
- `custom_meta` to add metadata, user insruction, your own unique ID, ...
- `user_token` to push the payload to a user (after [obtaining a user specific token](https://xumm.readme.io/docs/pushing-sign-requests))

A more complex payload [could look like this](https://gist.github.com/WietseWind/ecdfd58bece14e5d15e41138fa4b0f4a). A [reference for payload options & custom meta](https://xumm.readme.io/reference/post-payload) can be found in the [API Docs](https://xumm.readme.io/reference/post-payload).

Instead of providing a `txjson` transaction, a transaction formatted as HEX blob (string) can be provided in a `txblob` property.

##### Sdk.payload.get

```typescript
async Sdk.payload.get (
  payload: string | CreatedPayload,
  returnErrors: boolean = false
): Promise<XummPayload | null>
```

To get payload details, status and if resolved & signed: results (transaction, transaction hash, etc.) you can `get()` a payload.

Note! Please don't use _polling_! The XUMM API offers Webhooks (configure your Webhook endpoint in the [Developer Console](https://apps.xumm.dev)) or use [a subscription](#payload-subscriptions-live-updates) to receive live payload updates (for non-SDK users: [Webhooks](https://xumm.readme.io/docs/payload-status)).

You can `get()` a payload by:

- Payload UUID  
  ```javascript
  const payload = await Sdk.payload.get('aaaaaaaa-bbbb-cccc-dddd-1234567890ab')
  ```

- Passing a created Payload object (see: [Sdk.payload.create](#sdk.payload.create))  
  ```javascript
  const newPayload: XummTypes.CreatedPayload = {txjson: {...}}
  const created = await Sdk.payload.create(newPayload)
  const payload = await Sdk.payload.get(created)
  ```

If a payload can't be fetched (eg. doesn't exist), `null` will be returned, unless a second param (boolean) is provided to get the SDK to throw an Error in case a payload can't be retrieved:

```javascript
await Sdk.payload.get('aaaaaaaa-bbbb-cccc-dddd-1234567890ab', true)
```

##### Sdk.payload.create

```typescript
async Sdk.payload.create (
  payload: CreatePayload,
  returnErrors: boolean = false
): Promise<CreatedPayload | null>
```

WIP

##### Sdk.payload.cancel

```typescript
async Sdk.payload.cancel (
  payload: string | XummPayload | CreatedPayload,
  returnErrors: boolean = false
): Promise<DeletedPayload | null>
```

WIP

#### Payload subscriptions: live updates

WIP

- Note: Two methods: callback + return non void = break, of return object en resolve()
  - onPayloadEvent
- Reminder: type for callback event?

##### Sdk.payload.subscribe

```typescript
async Sdk.payload.subscribe (
    payload: string | XummPayload | CreatedPayload,
    callback?: onPayloadEvent
  ): Promise<PayloadSubscription>
```

The [`<PayloadSubscription>`](https://github.com/XRPL-Labs/XUMM-SDK/blob/master/src/types/Payload/PayloadSubscription.ts) object looks like this:

WIP

##### Sdk.payload.createAndSubscribe

```typescript
async Sdk.payload.createAndSubscribe (
    payload: CreatePayload,
    callback?: onPayloadEvent
  ): Promise<PayloadAndSubscription>
```

The [`<PayloadAndSubscription>`](https://github.com/XRPL-Labs/XUMM-SDK/blob/master/src/types/Payload/PayloadAndSubscription.ts) object is basically a [`<PayloadSubscription>`](https://github.com/XRPL-Labs/XUMM-SDK/blob/master/src/types/Payload/PayloadSubscription.ts) object with the created payload results in the `created` property:

WIP

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

Build, run, show debug output & watch `dist/samples/dev.js`, compiled from `samples/dev.ts` using `npm run dev`. The `samples/dev.ts` file is **not included by default**.

[Here's a sample `samples/dev.ts` file](https://gist.github.com/WietseWind/e2e9729619872cb736fe29b486e9c623).