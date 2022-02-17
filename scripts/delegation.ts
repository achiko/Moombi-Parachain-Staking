import hre, { ethers } from 'hardhat'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import { Staking__factory, Staking, MokStake__factory } from '../typechain'
import 'colors'

let STAKING_CONTRACT_ADDRESS = ''
const PRECOMPILED_CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000800'

let staking: Staking

async function main() {
  const [admin, nominator] = await ethers.getSigners()

  if (STAKING_CONTRACT_ADDRESS == '') {
    staking = await new Staking__factory(admin).deploy(PRECOMPILED_CONTRACT_ADDRESS)
    await staking.deployed()
    STAKING_CONTRACT_ADDRESS = staking.address
    console.log(`New Deployed STAKING_CONTRACT : , ${STAKING_CONTRACT_ADDRESS}`.green)
  } else {
    console.log(`Existing Deployed STAKING_CONTRACT : , ${STAKING_CONTRACT_ADDRESS}`.green)
    staking = Staking__factory.connect(STAKING_CONTRACT_ADDRESS, admin)
  }

  console.log(`Nominator Deposit 1000 GLMR`.green)
  let tx = await staking.connect(nominator).deposit({ value: parseUnits('1000', 18) })
  let res = await tx.wait(1)
  console.log(res)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
