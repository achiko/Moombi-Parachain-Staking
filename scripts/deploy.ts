import { ethers } from 'hardhat'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import { assert } from 'chai'
import { deployErc20Token, Erc20Token } from '@thenextblock/hardhat-erc20'

async function main() {
  const [deployer] = await ethers.getSigners()
  console.log('Deployer address : ', await deployer.getAddress())
  // console.log("Deployer Balance : ", await deployer.getBalance());
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
