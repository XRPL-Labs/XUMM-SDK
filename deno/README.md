# XUMM SDK (JS/TS)

Interact with the XUMM SDK from Javascript / Typescript environments.

### For [Deno](https://deno.land/)

This a proof of concept. Experimental (but tested & working).

Most of the content of the [node README](https://github.com/XRPL-Labs/XUMM-SDK) applies.

### Requirements (permissions)

- `--allow-net` (the API needs to be able to call out)
- `--allow-env`: `XUMM_API*` (optional: `DEBUG`)
- `--allow-read`: `.env` and `.env.defaults` (dotenv, to read the API key & secret)

### Use

Import the SDK like this:
```
import {XummSdk} from 'https://raw.githubusercontent.com/XRPL-Labs/XUMM-SDK/deno_v0.1.2/mod.ts'
```

A sample script `test.ts` could look like this:

```typescript
import {XummSdk} from 'https://raw.githubusercontent.com/XRPL-Labs/XUMM-SDK/deno_v0.1.2/mod.ts'

const Sdk = new XummSdk()
const pong = await Sdk.ping()

console.log(pong)
```

Now export your XUMM API Key and -secret:

```bash
export XUMM_APIKEY=aaaaaaaa-1111-2222-3333-abcdabcdabcd
export XUMM_APISECRET=bbbbbbbb-3333-4444-5555-abcdabcdabcd
```

Now run your sample:
```bash
deno run --allow-net --allow-env=XUMM_API* --allow-read=.env,.env.defaults test.ts
```

#### Debug

Run `DEBUG=xumm* deno run --allow-net --allow-env=DEBUG,XUMM_API* --allow-read=.env,.env.defaults samples/deno.ts`
