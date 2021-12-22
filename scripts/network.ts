import { ethers } from 'hardhat'
import { formatUnits, parseUnits } from 'ethers/lib/utils'

async function main() {
  const [deployer] = await ethers.getSigners()
  const feeData = await ethers.provider.getFeeData()

  console.log('------ Network gas Fee Information  ----')
  const { gasPrice, maxFeePerGas, maxPriorityFeePerGas } = feeData
  console.log('gasPrice: ', gasPrice ? formatUnits(gasPrice, 'gwei') : '-')
  console.log('maxFeePerGas: ', maxFeePerGas ? formatUnits(maxFeePerGas, 'gwei') : '-')
  console.log('maxPriorityFeePerGas: ', maxPriorityFeePerGas ? formatUnits(maxPriorityFeePerGas, 'gwei') : '-')
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
