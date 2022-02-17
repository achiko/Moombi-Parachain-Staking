// Required imports
import { ApiPromise, WsProvider, HttpProvider } from '@polkadot/api'
import 'colors'

export async function createBlock(blockCount: number) {
  // console.log(`Start Creating ${blockCount} blocks`)
  const provider = new WsProvider('ws://127.0.0.1:9944')
  const api = await ApiPromise.create({ provider })
  // const [chain, nodeName, nodeVersion] = await Promise.all([api.rpc.system.chain(), api.rpc.system.name(), api.rpc.system.version()])
  // console.log(`You are connected to chain ${chain} using ${nodeName} v${nodeVersion}`)
  console.log(`Start Create ${blockCount}(s)`.green)

  for (let i = 0; i < blockCount; i++) {
    let response = await api.rpc.engine.createBlock(true, true)
    let hash = response.toJSON().hash?.toString() || ''
    // let finalizeReposne = await api.rpc.engine.finalizeBlock(hash)
    // console.log(`${hash}`)
  }

  console.log(`Created ${blockCount} Block(s)`.green)
}
