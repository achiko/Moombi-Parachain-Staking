// Import the API
import { WsProvider, ApiPromise } from '@polkadot/api'
import 'colors'

const ALITH = '0xf24ff3a9cf04c71dbc94d0b566f7a27b94566cac'
const COLLATOR = '0x527FC4060Ac7Bf9Cd19608EDEeE8f09063A16cd4'

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
  // signedBlock.block.extrinsics.forEach((ex, index) => {
  //   // the extrinsics are decoded by the API, human-like view
  //   // console.log(index, ex.toHuman())
  //   // console.log('----')
  //   // const {
  //   //   isSigned,
  //   //   meta,
  //   //   method: { args, method, section }
  //   // } = ex
  //   // // explicit display of name, args & documentation
  //   // console.log(`${section}.${method}(${args.map((a) => a.toString()).join(', ')})`)
  //   // // console.log(meta.documentation.map((d) => d.toString()).join('\n'))
  //   // // signer/nonce info
  //   // if (isSigned) {
  //   //   console.log(`signer=${ex.signer.toString()}, nonce=${ex.nonce.toString()}`)
  //   // }
  // })

  // console.log(signedBlock.toHuman())
  // const { block } = signedBlock.toJSON() as BLOCK

  // const blockHash = await api.rpc.chain.getBlockHash(blockNumber)
  // console.log('BlockHash :  ', blockHash)

  const CANDIDATE = '0xf24ff3a9cf04c71dbc94d0b566f7a27b94566cac' // ALITHE
  const DELEGATOR = '0xc01Ee7f10EA4aF4673cFff62710E1D7792aBa8f3'

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

  const candidateInfo = await api.query.parachainStaking.candidateInfo(CANDIDATE)
  console.log(candidateInfo.toHuman())
  console.log(`---------------------------------------`)

  console.log(`parachainStaking.delegatorState ${DELEGATOR}`.green)
  const delegatorState = await api.query.parachainStaking.delegatorState(DELEGATOR)
  console.log(delegatorState.toHuman())

  const requests = delegatorState.toHuman(true)
  console.log('Request: ', requests)
  if (requests) {
    // @ts-ignore: Unreachable code error
    console.log(requests.requests)
  }
  console.log(`---------------------------------------`.green)

  console.log(`Top Delegations `)
  const topDelegations = await api.query.parachainStaking.topDelegations(CANDIDATE)
  console.log(topDelegations.toHuman())
  console.log(`---------------------------------------`.green)

  const totalStaked = await api.query.parachainStaking.total()
  console.log('Total Staked : ', totalStaked.toHuman())

  process.exit(0)
}

main().catch((error) => {
  console.error(error)
  process.exit(-1)
})
