// Import the API
import { WsProvider, ApiPromise } from '@polkadot/api'

const ALITH = '0xf24ff3a9cf04c71dbc94d0b566f7a27b94566cac'
const COLLATOR = '0xC2Bf5F29a4384b1aB0C063e1c666f02121B6084a'

interface BLOCK {
  header: {
    parentHash: string
    number: string
    stateRoot: string
    extrinsicsRoot: string
    // digest: { logs: string[] }
  }
}

async function main() {
  // Create our API with a default connection to the local node
  const provider = new WsProvider('ws://127.0.0.1:9944')
  const api = await ApiPromise.create({ provider })

  // console.log('SighnedBlock : ')
  // const signedBlock = await api.rpc.chain.getBlock()

  // no blockHash is specified, so we retrieve the latest
  const signedBlock = await api.rpc.chain.getBlock()
  const blockNumber = signedBlock.block.header.number.toHuman()
  // console.log('Block Number : ', signedBlock.block.header.number.toHuman())

  // the information for each of the contained extrinsics
  signedBlock.block.extrinsics.forEach((ex, index) => {
    // the extrinsics are decoded by the API, human-like view
    console.log(index, ex.toHuman())
    // console.log('----')
    // const {
    //   isSigned,
    //   meta,
    //   method: { args, method, section }
    // } = ex
    // // explicit display of name, args & documentation
    // console.log(`${section}.${method}(${args.map((a) => a.toString()).join(', ')})`)
    // // console.log(meta.documentation.map((d) => d.toString()).join('\n'))
    // // signer/nonce info
    // if (isSigned) {
    //   console.log(`signer=${ex.signer.toString()}, nonce=${ex.nonce.toString()}`)
    // }
  })

  // console.log(signedBlock.toHuman())
  // const { block } = signedBlock.toJSON() as BLOCK

  // const blockHash = await api.rpc.chain.getBlockHash(blockNumber)
  // console.log('BlockHash :  ', blockHash)

  const round = await api.query.parachainStaking.round()
  console.log('Round: ', round.toHuman())

  console.log('Print Candidate Pool Listing ... ')
  const candidatePool = await api.query.parachainStaking.candidatePool()
  console.log(candidatePool.toHuman())

  const awardedPts = await api.query.parachainStaking.awardedPts(blockNumber, ALITH)
  console.log('BlockNumber:  ', blockNumber, ' Points: ', awardedPts.toHuman())

  const collatorCommission = await api.query.parachainStaking.collatorCommission()
  console.log('collatorCommission:', collatorCommission.toHuman())

  console.log('Candidate State : ')
  const candidateState = await api.query.parachainStaking.candidateState(ALITH)
  console.log(candidateState.toHuman())

  const collatorState = await api.query.parachainStaking.collatorState2(COLLATOR)
  console.log('Collator State 2:', collatorState.toHuman())

  console.log('Nominator State : ')
  const nominatorState = await api.query.parachainStaking.nominatorState2(COLLATOR)
  console.log(nominatorState.toHuman())

  const totalStaked = await api.query.parachainStaking.total()
  console.log('Total Staked : ', totalStaked.toHuman())
}

main().catch((error) => {
  console.error(error)
  process.exit(-1)
})
