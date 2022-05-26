// Sample: JWT from Backend (node) with custom JWT datastore

const { XummSdkJwt } = require('../dist/src/') // require('xumm-sdk')
const fs = require('fs')

const main = async () => {
  try {
    const Sdk = new XummSdkJwt('xxxxxxxx-xxxx-xxxx-xxxx-cafebabe0000', 'xxxxxxxx-xxxx-xxxx-xxxx-cafebabe0000', {
      store: {
        get (ott) {
          console.log('-- Custom ott store GET')

          try {
            const data = fs.readFileSync('/tmp/xappjwt')
            if (data && data?.toString && data.toString().split(':')[0] === ott) {
              return JSON.parse(data.toString().split(':').slice(1).join(':'))
            }
          } catch (e) {}
        },
        set (ott, ottData) {
          console.log('-- Custom ott store SET', ott)

          try {
            fs.writeFileSync('/tmp/xappjwt', ott + ':' + JSON.stringify(ottData))
          } catch (e) {}
        }
      }
    })

    // Sdk.setEndpoint('http://localhost:3001')
    const ottData = await Sdk.getOttData()
    console.log('ottData', ottData.version, ottData.account)

    const pong = await Sdk.ping()
    console.log(pong.application)
  } catch (e) {
    console.log({error: e.message, stack: e.stack})
  }
}

main()
