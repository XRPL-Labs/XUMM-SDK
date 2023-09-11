import Debug from 'debug'
import {XummSdkJwt} from '../src/'

const log = Debug('xumm-sdk:sample')

const main = async () => {
  try {
    const Sdk = new XummSdkJwt('...')

    const pong = await Sdk.ping()
    log({pong})

    log('hookhashes', await Sdk.getHookHashes())

    log('hookhash', await Sdk.getHookHash('31C3EC186C367DA66DFBD0E576D6170A2C1AB846BFC35FC0B49D202F2A8CDFD8'))

    log('rails', await Sdk.getRails())
  } catch (e) {
    log({
      error: (e as Error).message,
      stack: (e as Error).stack
    })
  }
}

main()
