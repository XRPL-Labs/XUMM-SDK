import Debug from 'debug'
import {XummSdk} from '../src/'

const log = Debug('xumm-sdk:sample')

const main = async () => {
  try {
    const Sdk = new XummSdk()

    const pong = await Sdk.ping()
    log({pong})

    // const payload = await Sdk.payload.create({
    //   custom_meta: {
    //     instruction: 'Hey ❤️! Please sign for\n\nThis\nThat 🍻'
    //   },
    //   user_token: 'ec079824-b804-49be-b521-a9502bc306ae',
    //   txjson: {
    //     TransactionType : 'Payment',
    //     Destination : 'rPEPPER7kfTD9w2To4CQk6UCfuHM9c6GDY'
    //   }
    // })
    // log(payload)

    log('get', await Sdk.xApp.get('d7a0dd9e-a757-4b77-afd1-9970eb54e54d'))

    log('event', await Sdk.Push.event({
      user_token: 'ec079824-b804-49be-b521-a9502bc306ae',
      subtitle: 'AML inquiry',
      body: 'Please provide deposit information',
      data: {
        tx: '901AB6028204AE3EDB4D919EFC0BF36A25F73975674DCCA3FC54AEA85D9F56A0',
        account: 'rwietsevLFg8XSmG3bEZzFein1g8RBqWDZ'
      }
    }))

    log('push', await Sdk.Push.notification({
      user_token: 'ec079824-b804-49be-b521-a9502bc306ae',
      subtitle: 'AML inquiry',
      body: 'Please provide deposit information',
      data: {
        tx: '901AB6028204AE3EDB4D919EFC0BF36A25F73975674DCCA3FC54AEA85D9F56A0',
        account: 'rwietsevLFg8XSmG3bEZzFein1g8RBqWDZ'
      }
    }))

  } catch (e) {
    log({
      error: e.message,
      stack: e.stack
    })
  }
}

main()
