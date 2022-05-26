// Sample: JWT from Backend (node) with custom JWT datastore

const { XummSdkJwt } = require('../dist/src/') // require('xumm-sdk')

const myJwt = 'xxxx.yyyy.zzzz'

const main = async () => {
  try {
    const Sdk = new XummSdkJwt(myJwt)
    // Sdk.setEndpoint('http://localhost:3001')

    const pong = await Sdk.ping()
    console.log(pong.application)

    const payload = Sdk.payload.createAndSubscribe({
      TransactionType: 'SignIn'
    }, e => {
      console.log(e.data)

      if (typeof e.data.signed !== 'undefined') {
        return e.data
      }
    })

    console.log((await payload).created.next.always)

    await payload

    console.log('Resolved :)')
  } catch (e) {
    console.log({error: e.message, stack: e.stack})
  }
}

main()
