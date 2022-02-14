import hre, { ethers } from 'hardhat'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import { assert } from 'chai'
import { Staking__factory, Staking, MokStake__factory } from '../typechain'
import { ContractReceipt, ContractTransaction } from '@ethersproject/contracts'
import 'colors'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { BigNumber } from 'ethers'

ethers.utils.Logger.setLogLevel(ethers.utils.Logger.levels.ERROR)

const COLLATOR = '0xf24ff3a9cf04c71dbc94d0b566f7a27b94566cac'
const PRECOMPILED_CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000800'
const ONE_UNIT = parseUnits('1', 18)
const ZERO_UNIT = parseUnits('0')

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

describe.only('Staking contract', async function () {
  async function balanceOf(signer: SignerWithAddress): Promise<BigNumber> {
    return await staking.balanceOf(signer.address)
  }
  let staking: Staking
  let deployer: SignerWithAddress
  let nominator1: SignerWithAddress
  let nominator2: SignerWithAddress
  let nominator3: SignerWithAddress

  // TODO: chek async before whats wrong....
  before(async () => {
    ;[deployer, nominator1, nominator2, nominator3] = await ethers.getSigners()
    console.log('DEPLOYER ADDRESS : ', deployer.address)
    staking = await new Staking__factory(deployer).deploy(PRECOMPILED_CONTRACT_ADDRESS)
    await staking.deployed()

    STAKING_CONTRACT_ADDRESS = staking.address
    console.log('STAKING_CONTRACT_ADDRESS : ', STAKING_CONTRACT_ADDRESS)

    let totalDeposited = await staking.totalDeposited()
    assert.isTrue(totalDeposited.eq(ZERO_UNIT), 'WRONG totalDeposited')
    console.log(totalDeposited.toString())
  })

  it('#1 Should get correct intiall parameters ', async function () {
    assert.equal(await staking.symbol(), 'stGLMR')

    let totalDeposited = await staking.totalDeposited()
    assert.isTrue(totalDeposited.eq(ZERO_UNIT), 'WRONG totalDeposited')

    let totalStaked = await staking.totalStaked()
    assert.isTrue(totalStaked.eq(ZERO_UNIT), 'WRONG totalStaked')

    let totalRewarded = await staking.totalRewarded()
    assert.isTrue(totalRewarded.eq(ZERO_UNIT), 'WRONG totalRewarded')

    let totalUnstaked = await staking.totalUnstaked()
    assert.isTrue(totalUnstaked.eq(ZERO_UNIT), 'WRONG totalUnstaked')

    let totalShares = await staking.totalShares()
    assert.isTrue(totalShares.eq(ZERO_UNIT), 'WRONG totalShares')

    const totalSupply = await staking.totalSupply()
    assert.isOk(totalSupply.eq(ZERO_UNIT), 'WRONG TOTAL SUPPLY')

    // assert.isOk(await staking.is_selected_candidate(COLLATOR), 'COLLATOR IS NOT A SELECTED CANDIDATE')

    const gasPrice = await ethers.provider.getGasPrice()
    console.log('Gas Price gwei : ', formatUnits(gasPrice, 'gwei'))
    console.log('gasPrice : ', gasPrice.toString())
  })

  it('#2 Should Show correct Deposits ', async function () {
    // nominator2
    // console.log(` ---- Nominators ---- `)
    await staking.connect(nominator1).deposit({ value: parseUnits('10', 18) })
    let nominator1Balance = await balanceOf(nominator1)
    assert.isTrue(nominator1Balance.eq(ONE_UNIT.mul(10)), 'NOMINATOR-1 BALANCE WRONG')
    assert.isTrue((await staking.totalSupply()).eq(ONE_UNIT.mul(10)), 'TOTAL SUPPLY WRONG')

    // nominator2
    await staking.connect(nominator2).deposit({ value: parseUnits('10', 18) })
    let nominator2Balance = await balanceOf(nominator2)
    assert.isTrue(nominator2Balance.eq(ONE_UNIT.mul(10)), 'NOMINATOR-2 BALANCE WRONG')
    assert.isTrue((await staking.totalSupply()).eq(ONE_UNIT.mul(20)), 'TOTAL SUPPLY WRONG')

    // nominator3 deposit 30
    await staking.connect(nominator3).deposit({ value: parseUnits('30', 18) })
    let nominator3Balance = await balanceOf(nominator3)
    assert.isTrue(nominator3Balance.eq(ONE_UNIT.mul(30)), 'NOMINATOR-3 BALANCE WRONG')
    assert.isTrue((await staking.totalSupply()).eq(ONE_UNIT.mul(50)), 'TOTAL SUPPLY WRONG')

    // Chek if the balanses is not worong after state Update
    assert.isTrue((await balanceOf(nominator1)).eq(ONE_UNIT.mul(10)), 'NOMINATOR-1 BALANCE WRONG')
    assert.isTrue((await balanceOf(nominator2)).eq(ONE_UNIT.mul(10)), 'NOMINATOR-1 BALANCE WRONG')

    console.log('Start Delegating')
    staking.delegateCall(COLLATOR, parseUnits('30', 18))

    assert.isTrue((await balanceOf(nominator1)).eq(ONE_UNIT.mul(10)), 'NOMINATOR-1 BALANCE WRONG')
    assert.isTrue((await balanceOf(nominator2)).eq(ONE_UNIT.mul(10)), 'NOMINATOR-1 BALANCE WRONG')
    assert.isTrue((await balanceOf(nominator3)).eq(ONE_UNIT.mul(30)), 'NOMINATOR-3 BALANCE WRONG')
    assert.isTrue((await staking.totalSupply()).eq(ONE_UNIT.mul(50)), 'TOTAL SUPPLY WRONG')
  })

  it.skip('# 2 Work with existing Staking Contract ', async function () {
    const [deployer, nominator] = await ethers.getSigners()
    const stakingContractInstance = Staking__factory.connect(STAKING_CONTRACT_ADDRESS, deployer)

    // const tx = await stakingContractInstance.deposit({ value: ONE_UNIT.mul(1) })
    // parseLogs(await tx.wait(1))
    // const contractBalance = formatUnits(await stakingContractInstance.getTotalGLMR(), 18)
    // console.log('Contract balance : ', contractBalance)

    const tx1 = await stakingContractInstance.connect(nominator).deposit({ value: ONE_UNIT.mul(10) })
    parseLogs(await tx1.wait(1))

    const tx2 = await stakingContractInstance.delegateCall(COLLATOR, ONE_UNIT.mul(11), gasParams)

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
  // const [totalGLMR, totalDeposited, totalStaked, totalRewarded] = await stakingContractInstance.getContractSnapshot()
  // console.log(
  //   `
  //       totalGLMR: ${totalGLMR}
  //       totalDeposited: ${totalDeposited}
  //       totalStaked: ${totalStaked}
  //       totalRewarded: ${totalRewarded}
  //     `
  // )
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
