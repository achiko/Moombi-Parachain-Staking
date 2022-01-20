import hre, { ethers } from 'hardhat'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import { Staking__factory, Staking, MokStake__factory } from '../typechain'

const STAKING_CONTRACT_ADDRESS = '0xc2bf5f29a4384b1ab0c063e1c666f02121b6084a'

async function main() {
  const [deployer, nominator] = await ethers.getSigners()

  const stakingContractInstance = Staking__factory.connect(STAKING_CONTRACT_ADDRESS, deployer)
  console.log('Contract balance FROM CONTRACT: ', formatUnits(await stakingContractInstance.getTotalGLMR(), 18))

  const contractBalance = await ethers.provider.getBalance(STAKING_CONTRACT_ADDRESS)
  console.log('Contract Balance : ', formatUnits(contractBalance, 18))

  console.log('TOKEN PART: ')

  console.log('TOTAL SUPPLY :', formatUnits(await stakingContractInstance.totalSupply(), 18))

  console.log('Nomiator : ', nominator.address)

  const userTokens = await stakingContractInstance.balanceOf(nominator.address)
  console.log('USER TOKENS : ', formatUnits(userTokens, 18))

  const tokenBalance = await stakingContractInstance.tokenBalance(nominator.address)
  console.log('tokenBalance : ', formatUnits(tokenBalance, 18))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
