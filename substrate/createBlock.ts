// Required imports
import { ApiPromise, WsProvider, HttpProvider } from '@polkadot/api'
import { resolve } from 'path/posix'

export async function createBlock(api: ApiPromise, blockCount: number) {
  console.log(`Start Creating ${blockCount} blocks`)
  const [chain, nodeName, nodeVersion] = await Promise.all([api.rpc.system.chain(), api.rpc.system.name(), api.rpc.system.version()])
  console.log(`You are connected to chain ${chain} using ${nodeName} v${nodeVersion}`)

  for (let i = 0; i < blockCount; i++) {
    let response = await api.rpc.engine.createBlock(true, true)
    console.log(response.toHuman().hash)
  }
}
