// Required imports
import { ApiPromise, WsProvider, HttpProvider } from '@polkadot/api'

import * as dotenv from 'dotenv'
dotenv.config()

async function main() {
  console.log('RPC_URL : ', process.env.RPC_WS)

  // Initialise the provider to connect to the local node
  // const provider = new WsProvider('wss://moonbeam-alpha.api.onfinality.io/public-ws')
  const provider = new WsProvider('ws://127.0.0.1:9944')

  // Create the API and wait until ready
  const api = await ApiPromise.create({ provider })

  // Retrieve the chain & node information information via rpc calls
  const [chain, nodeName, nodeVersion] = await Promise.all([api.rpc.system.chain(), api.rpc.system.name(), api.rpc.system.version()])
  console.log(`You are connected to chain ${chain} using ${nodeName} v${nodeVersion}`)

  //   console.log('--------------------------------')
  const collatorAccount = '0xf24FF3a9CF04c71Dbc94D0b566f7A27B94566cac'
  const collatorInfo = await api.query.parachainStaking.collatorState2(collatorAccount)
  console.log('Result :', collatorInfo.toJSON())

  const selectedCandidates = await api.query.parachainStaking.selectedCandidates()
  console.log('----  Selected Candidates ---')
  console.log(selectedCandidates.toJSON())
}

main()
  .catch(console.error)
  .finally(() => process.exit())
