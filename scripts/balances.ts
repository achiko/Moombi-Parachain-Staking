import hre, { ethers } from 'hardhat'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import { Staking__factory, Staking, MokStake__factory } from '../typechain'

const STAKING_CONTRACT_ADDRESS = '0x3649E46eCD6A0bd187f0046C4C35a7B31C92bA1E'

async function main() {
  const [deployer, nominator] = await ethers.getSigners()
  const staking = Staking__factory.connect(STAKING_CONTRACT_ADDRESS, deployer)
  const contractBalance = await ethers.provider.getBalance(STAKING_CONTRACT_ADDRESS)

  console.log('CONTRACT BALANCE : ', formatUnits(contractBalance, 18))
  console.log('CONTRACT BALANCE (Contact Call) : ', formatUnits(await staking.getGLMRBalance(), 18))
  console.log('------------------------------------')
  console.log('TOKEN PART: ')
  console.log('TOTAL SUPPLY :', formatUnits(await staking.totalSupply(), 18))
  const userTokens = await staking.balanceOf(nominator.address)
  console.log('USER TOKENS : ', formatUnits(userTokens, 18))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
