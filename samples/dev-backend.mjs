// Sample: JWT from Backend (node) with custom JWT datastore

import { XummSdk } from '../dist/src/index.js' // 'xumm-sdk'

// To keep the process alive while testing:
//
// setInterval(() => {
//   console.log('Hi')
// }, 60_000)

// nginx Docker (`nginx:alpine`) config to proxy for local endpoint testing
//
// map $http_upgrade $connection_upgrade {
//   default upgrade;
//   '' '';
// }
// 
// server {
//   listen       80;
//   server_name  localhost;
// 
//   proxy_http_version     1.1;
//   proxy_ssl_session_reuse off;
//   proxy_ssl_server_name on;
//   proxy_ssl_name xumm.app;
// 
//   location / {
//     resolver 1.1.1.1;
//     proxy_set_header Host xumm.app;
//     proxy_pass https://xumm.app;
// 
//     proxy_set_header Upgrade $http_upgrade;
//     proxy_set_header Connection $connection_upgrade;
//   }
// }


try {
  const Sdk = new XummSdk(process.env.APIKEY, process.env.SECRET)
  // Local development
  Sdk.setEndpoint('http://localhost:9231')

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

  // setTimeout(async () => {
  //   (await payload).websocket.close()
  // }, 4000)

  await (await payload).resolved

  console.log('Resolved :)')
} catch (e) {
  console.log({error: e.message, stack: e.stack})
}
