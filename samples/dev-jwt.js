// Sample: JWT from Backend (node) with custom JWT datastore

const { XummSdkJwt } = require('../dist/src/') // require('xumm-sdk')
const fs = require('fs')

const main = async () => {
  try {
    const Sdk = new XummSdkJwt('ce0688f4-f7e7-4dd7-9366-ca2ce5487aa0', 'c83793aa-63c9-4ad2-b971-3d5a139098f1', {
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
