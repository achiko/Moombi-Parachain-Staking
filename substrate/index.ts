import { ApiPromise, WsProvider, HttpProvider } from '@polkadot/api'

import * as dotenv from 'dotenv'
import { exit } from 'process'
dotenv.config()

import { createBlock } from './createBlock'

async function main() {
  const provider = new WsProvider('ws://127.0.0.1:9944')
  const api = await ApiPromise.create({ provider })
  await createBlock(api, 24000)
}

main()
  .catch(console.log)
  .finally(() => process.exit())
