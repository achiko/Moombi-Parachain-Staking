import hre, { ethers } from 'hardhat'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import { assert } from 'chai'
import { Staking__factory, Staking, MokStake__factory } from '../typechain'
import { ContractReceipt, ContractTransaction } from '@ethersproject/contracts'
import 'colors'
import { resolve } from 'path/posix'

ethers.utils.Logger.setLogLevel(ethers.utils.Logger.levels.ERROR)

// 0xf24FF3a9CF04c71Dbc94D0b566f7A27B94566cac
const COLLATOR = '0xf24FF3a9CF04c71Dbc94D0b566f7A27B94566cac'
const PRECOMPILED_CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000800'
const ONE_UNIT = parseUnits('1', 18)

let STAKING_CONTRACT_ADDRESS = ''

const gasParams = {
  gasLimit: '2000000',
  gasPrice: parseUnits('1', 'gwei')
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function waitUntilBlock(blockNumber: number) {
  let currentBlock = ethers.provider.blockNumber
  for (;;) {
    console.log(ethers.provider.blockNumber)
    currentBlock = ethers.provider.blockNumber
    if (currentBlock === blockNumber) {
      return currentBlock
    }
  }
}

describe('Staking contract', function () {
  it('# 1 Deploy Staking Contract & Test Precompiled ', async function () {
    const [deployer] = await ethers.getSigners()
    console.log('Deployer Address: ', deployer.address)
    const stakingFactory = await new Staking__factory(deployer).deploy(PRECOMPILED_CONTRACT_ADDRESS, { value: ONE_UNIT })
    await stakingFactory.deployed()
    STAKING_CONTRACT_ADDRESS = stakingFactory.address
    console.log('Staking Contract : ', STAKING_CONTRACT_ADDRESS)

    const contractGLMRBalance = await stakingFactory.getTotalGLMR()
    assert(contractGLMRBalance.eq(ONE_UNIT), 'WRONG CONTRACT BALANCE')

    const totalSupply = await stakingFactory.totalSupply()
    assert.isOk(totalSupply.eq(ONE_UNIT), 'WRONG TOTAL SUPPLY')
    assert.isOk(await stakingFactory.is_selected_candidate(COLLATOR), 'COLLATOR IS NOT A SELECTED CANDIDATE')

    // const gasPrice = await ethers.provider.getGasPrice()
    // console.log('Gas Price gwei : ', formatUnits(gasPrice, 'gwei'))
    // console.log('gasPrice : ', gasPrice.toString())
  })

  it('# 2 Work with existing Staking Contract ', async function () {
    const [deployer, nominator] = await ethers.getSigners()
    const stakingContractInstance = Staking__factory.connect(STAKING_CONTRACT_ADDRESS, deployer)

    // const tx = await stakingContractInstance.deposit({ value: ONE_UNIT.mul(1) })
    // parseLogs(await tx.wait(1))
    // const contractBalance = formatUnits(await stakingContractInstance.getTotalGLMR(), 18)
    // console.log('Contract balance : ', contractBalance)

    const tx1 = await stakingContractInstance.connect(nominator).deposit({ value: ONE_UNIT.mul(10) })
    parseLogs(await tx1.wait(1))

    const tx2 = await stakingContractInstance.delegate(COLLATOR, ONE_UNIT.mul(11), gasParams)

    const txResult = await tx2.wait(1)

    console.log('BLOCK NUMBER :::::: ', await ethers.provider.getBlockNumber())
    console.log('Delay .....................')
    await delay(100 * 600)
    console.log('BLOCK NUMBER AFTER DELAY .... ', await ethers.provider.getBlockNumber())

    // const iface = new ethers.utils.Interface(Staking__factory.abi)
    // const log = iface.parseLog(txResult.logs[0])
    // const { _from, _delegator, _candidate, _candidateDelegationCount, _delegatorDelegationCount, _amount } = log.args

    // console.log(
    //   `
    //   ___________________________________________
    //     ${log.name} -
    //     _from:                         ${_from} |
    //     _delegator:                    ${_delegator} |
    //     _candidate:                    ${_candidate} |
    //     _candidateDelegationCount:     ${_candidateDelegationCount} |
    //     _delegatorDelegationCount:     ${_delegatorDelegationCount} |
    //     _amount:                       ${_amount}
    //   ___________________________________________
    //   `
    // )

    await readSnapshot(stakingContractInstance)

    const tx3 = await stakingContractInstance.schedule_revoke_delegation(COLLATOR, gasParams)
    await tx3.wait(1)

    // const tx4 = await stakingContractInstance.execute_leave_delegators({
    //   gasLimit: '2000000',
    //   gasPrice: parseUnits('1', 'gwei')
    // })
    // //
    // await tx4.wait(1)

    await readSnapshot(stakingContractInstance)

    assert(true)
  })
})

async function readSnapshot(stakingContractInstance: Staking) {
  const [totalGLMR, totalDeposited, totalStaked, totalRewarded] = await stakingContractInstance.getContractSnapshot()
  console.log(
    `
        totalGLMR: ${totalGLMR}
        totalDeposited: ${totalDeposited}
        totalStaked: ${totalStaked}
        totalRewarded: ${totalRewarded} 
      `
  )
}

// Log parser
function parseLogs(result: ContractReceipt) {
  return console.log('null') // --- temp --- ///
  // eslint-disable-next-line no-unreachable
  const iface = new ethers.utils.Interface(Staking__factory.abi)
  const log0 = iface.parseLog(result.logs[0])
  const { from, blockNumber, totalDeposited, totalSupply, totalGLMR, tokenPrice, tokenAmount } = log0.args

  console.log(
    `
      ___________________________________________
      ${log0.name}      - 
      from:             ${from} | 
      blockNumber:      ${blockNumber} | 
      totalDeposited:   ${totalDeposited} | 
      totalSupply:      ${totalSupply} | 
      totalGLMR:        ${totalGLMR} | 
      tokenPrice        ${tokenPrice} | 
      tokenAmount:      ${tokenAmount}
      ___________________________________________
    `
  )

  const log1 = iface.parseLog(result.logs[1])
  console.log(` ${log1.name} ( ${log1.args._from}, ${log1.args._amount} ) `)

  const log2 = iface.parseLog(result.logs[2])
  console.log(` ${log2.name} ( ${log2.args.from}, ${log2.args.to}, ${log2.args.value} ) `)
}
