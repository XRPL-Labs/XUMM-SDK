#!/usr/bin/env bash

echo "Parsing TS to Deno"

replaceTsPath(){
	grep -R "from '$1'" ./deno/*|grep '.ts:'|cut -d ":" -f 1|sort|uniq|xargs -I___ sed -i -e "s+from '$1'+from '$2'+g" ___
}

# Remove TS files
find ./deno -iname '*.ts' -delete

# Create subdirectories based on src structure
find ./src -type d |sed "s/^.\/src/deno/g"|xargs -I___ mkdir -p ___

# Copy TS files from ./src to ./deno
find ./src -iname '*.ts'|sed "s/^.\/src//g"|xargs -I___ cp ./src___ ./deno___

# Transform TS / Deno paths (import / export)
replaceTsPath './' './index.ts'
replaceTsPath '../' '../index.ts'
replaceTsPath './types' './types/index.ts'
replaceTsPath './types/xumm-api' './types/xumm-api/index.ts'
replaceTsPath './utils' './utils.ts'
replaceTsPath './xumm-api' './xumm-api/index.ts'
replaceTsPath './SubscriptionCallbackParams' './SubscriptionCallbackParams.ts'
replaceTsPath './ApplicationDetails' './ApplicationDetails.ts'
replaceTsPath './AnyJson' './AnyJson.ts'

replaceTsPath './Storage' './Storage.ts'
replaceTsPath './Payload' './Payload.ts'
replaceTsPath './Meta' './Meta.ts'
replaceTsPath './xApp' './xApp.ts'
replaceTsPath './Push' './Push.ts'
replaceTsPath './JwtUserdata' './JwtUserdata.ts'

# Transform TS / Deno paths globally in type export 
sed -i -e "s+from './\(.*\)/\([a-zA-Z]*\)'+from './\1/\2.ts'+g" ./deno/types/index.ts

sed -i -e "s+: WsMessageEvent+: MessageEvent+g" ./deno/Payload.ts
sed -i -e "s+: WsCloseEvent+: CloseEvent+g" ./deno/Payload.ts

# Replace SDK user agent
packageVersion=$(cat package.json|grep version|cut -d '"' -f 4)
sed -i -e "s+'User-Agent': .*+'User-Agent': 'xumm-sdk/deno:${packageVersion}',+g" deno/Meta.ts
sed -i -e "s+if.*global.*window.*+if (typeof Deno !== 'undefined') {+g" deno/Meta.ts
sed -i -e "s+Running in node+Running in Deno+g" deno/Meta.ts

# Remove/replace TS specific packages
sed -i -e "s/\.\/index/.\/index.ts/g" ./deno/Meta.ts
sed -i -e "/import.*'os-browserify'/d" ./deno/Meta.ts
sed -i -e "/fetchPonyfill/d" ./deno/Meta.ts
sed -i -e "/import.*'..\/package.json'/d" ./deno/Meta.ts
sed -i -e "/import.*'..\/package.json'/d" ./deno/Meta.ts
sed -i -e "/import.*node-fetch'/d" ./deno/Meta.ts

sed -i -e "s+.*from 'dotenv'+import 'https://deno.land/x/dotenv/load.ts'+g" ./deno/index.ts

# Fix index Env/Dotenv import Deno vs Node
sed -i -e "/.*\/\* Node \*\/.*/d" ./deno/index.ts
sed -i -e "/.*\@ts-ignore/d" ./deno/index.ts
sed -i -e "s+/\* Deno \*/ ++g" ./deno/index.ts
sed -i -e "s/window.URLSearchParams/URLSearchParams/g" ./deno/index.ts
sed -i -e "s/\.\/types\/index/.\/types\/index.ts/g" ./deno/index.ts

# Meta AnyJson | Any » Unknown
sed -i -e "s/, any/, unknown/" ./deno/types/Meta/AnyJson.ts

# CamelCase
sed -i -e "s/user_device/'user_device'/" ./deno/types/xApp/xAppOttData.ts
sed -i -e "s/account_info/'account_info'/" ./deno/types/xApp/xAppOttData.ts

# Remove ws lib. import / namespace
sed -i -e "/import.*w3cwebsocket.*websocket'/d" ./deno/types/Payload/PayloadSubscription.ts
sed -i -e "/import WebSocket from 'ws'/d" ./deno/Payload.ts
sed -i -e "/import.*w3cwebsocket.*websocket'/d" ./deno/Payload.ts

# Update WS connection (skip mock)
sed -i -e "/.*globalThis as any.*MockedWebSocket.*/d" ./deno/Payload.ts
sed -i -e "s+  : \(new WebSocket.*\)+const socket = \1+g" ./deno/Payload.ts

# Deno specific Debug
replaceTsPath 'debug' 'https://deno.land/x/debug/mod.ts'

# Clean OSX sed backup files:
find ./deno -iname '*.ts-e' -delete

##### RUN CHECKS
echo "Done, generated"
echo
echo "Generated, running basic checks (Deno Docker)"
# echo "Cleaning"
# docker rmi hayd/deno
echo "Running"
docker run --rm -v $(pwd)/.deno-cache:/deno-dir -v $(pwd):/root/xumm-sdk hayd/deno sh -c 'cd ~/xumm-sdk; deno lint --unstable mod.ts deno/*.ts deno/*/*; deno test --allow-env=DEBUG,XUMM_APIKEY,XUMM_APISECRET --allow-read=.env,.env.defaults mod.ts'
echo "Done"
echo
