import hre, { ethers } from 'hardhat'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import { assert } from 'chai'
import { Staking__factory, Staking, MokStake__factory } from '../typechain'
import { ContractReceipt, ContractTransaction } from '@ethersproject/contracts'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { BigNumber } from 'ethers'

import { createBlock } from '../substrate/createBlock'
import 'colors'

ethers.utils.Logger.setLogLevel(ethers.utils.Logger.levels.ERROR)

const COLLATOR = '0xf24FF3a9CF04c71Dbc94D0b566f7A27B94566cac'
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

describe.only('STAKING', async function () {
  async function balanceOf(signer: SignerWithAddress): Promise<BigNumber> {
    return await staking.balanceOf(signer.address)
  }
  let staking: Staking
  let deployer: SignerWithAddress
  let nominator1: SignerWithAddress
  let nominator2: SignerWithAddress
  let nominator3: SignerWithAddress

  // TODO: chek async before whats wrong....
  it('# Deploy All contracts ', async () => {
    ;[deployer, nominator1, nominator2, nominator3] = await ethers.getSigners()
    console.log('DEPLOYER ADDRESS : ', deployer.address)
    staking = await new Staking__factory(deployer).deploy(PRECOMPILED_CONTRACT_ADDRESS)
    await createBlock(1)
    await staking.deployed()
    await createBlock(1)
    STAKING_CONTRACT_ADDRESS = staking.address
    console.log('STAKING_CONTRACT_ADDRESS : ', STAKING_CONTRACT_ADDRESS)
    let totalDeposited = await staking.totalDeposited()
    assert.isTrue(totalDeposited.eq(ZERO_UNIT), 'WRONG totalDeposited')
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

  it('#2 Deposit In Staking Contracts ......', async function () {
    // nominator2
    console.log(` ---- Nominators ---- `.green)
    console.log(`// nominator1: Deposit 10 GLMR`.yellow)
    let tx1 = await staking.connect(nominator1).deposit({ value: parseUnits('10', 18) })
    await createBlock(1)
    await tx1.wait(1)
    let nominator1Balance = await balanceOf(nominator1)
    console.log('Balance : ', nominator1Balance.toString())
    assert.isTrue(nominator1Balance.eq(parseUnits('10', 18)), 'NOMINATOR-1 BALANCE WRONG')
    assert.isTrue((await staking.totalSupply()).eq(parseUnits('10', 18)), 'TOTAL SUPPLY WRONG')

    console.log(`// nominator2: Deposit 10 GLMR`.yellow)
    let tx2 = await staking.connect(nominator2).deposit({ value: parseUnits('10', 18) })
    await createBlock(1)
    await tx2.wait(1)
    let nominator2Balance = await balanceOf(nominator2)
    assert.isTrue(nominator2Balance.eq(ONE_UNIT.mul(10)), 'NOMINATOR-2 BALANCE WRONG')
    assert.isTrue((await staking.totalSupply()).eq(ONE_UNIT.mul(20)), 'TOTAL SUPPLY WRONG')

    console.log(`// nominator3: Deposit 1000 GLMR`.yellow)
    let tx3 = await staking.connect(nominator3).deposit({ value: parseUnits('1000', 18) })
    await createBlock(1)
    await tx3.wait(1)
    let nominator3Balance = await balanceOf(nominator3)
    assert.isTrue(nominator3Balance.eq(ONE_UNIT.mul(1000)), 'NOMINATOR-3 BALANCE WRONG')
    assert.isTrue((await staking.totalSupply()).eq(ONE_UNIT.mul(1020)), 'TOTAL SUPPLY WRONG')

    console.log(`// Chek if the balanses is not worong after state Update`.yellow)
    assert.isTrue((await balanceOf(nominator1)).eq(ONE_UNIT.mul(10)), 'NOMINATOR-1 BALANCE WRONG')
    assert.isTrue((await balanceOf(nominator2)).eq(ONE_UNIT.mul(10)), 'NOMINATOR-1 BALANCE WRONG')

    console.log(`--- Start Delegating --- `.green)
    let tx4 = await staking.delegate(COLLATOR, parseUnits('1000', 18))
    await createBlock(1)
    await tx4.wait(1)
    await createBlock(1)

    console.log(`Chek all Accounts balances ... `.yellow)

    console.log('balanceOf(nominator1)', (await balanceOf(nominator1)).toString())
    assert.isTrue((await balanceOf(nominator1)).eq(ONE_UNIT.mul(10)), 'NOMINATOR-1 BALANCE WRONG')

    assert.isTrue((await balanceOf(nominator2)).eq(ONE_UNIT.mul(10)), 'NOMINATOR-1 BALANCE WRONG')
    assert.isTrue((await balanceOf(nominator3)).eq(ONE_UNIT.mul(1000)), 'NOMINATOR-3 BALANCE WRONG')
    assert.isTrue((await staking.totalSupply()).eq(ONE_UNIT.mul(1020)), 'TOTAL SUPPLY WRONG')
    assert.isTrue((await staking.getGLMRBalance()).eq(parseUnits('20', 18)), 'THE CONTRACT BALANCE IS WRONG')

    console.log(`Contract GLMR Balance is: ${formatUnits(await staking.getGLMRBalance(), 18)}`.green)
    await createBlock(1700)
    console.log(`Contract GLMR Balance is: ${formatUnits(await staking.getGLMRBalance(), 18)}`.green)

    console.log(`Contract GLMR Balance is: ${formatUnits(await staking.getGLMRBalance(), 18)}`.green)

    /// REVOKE DELEGATION !!!
    console.log(`Revoke delegation ..... `.bgGreen)
    let tx6 = await staking.scheduleRevokeDelegation(COLLATOR)
    await createBlock(1)
    await tx6.wait(1)
    await createBlock(1800)

    console.log(`Execute Revoke Request ..... `.bgGreen)
    let tx6_1 = await staking.executeDelegationRequest(COLLATOR)
    await createBlock(1)
    await tx6_1.wait(1)
    await createBlock(10)

    console.log(`Total rewarded Tokens :  ${formatUnits(await staking.getTotalRewardedGLMR(), 18)}`.green)
    console.log(`Contract GLMR Balance is: ${formatUnits(await staking.getGLMRBalance(), 18)}`.green)
  })

  it.skip('# 2 Work with existing Staking Contract ', async function () {
    const [deployer, nominator] = await ethers.getSigners()
    const stakingContractInstance = Staking__factory.connect(STAKING_CONTRACT_ADDRESS, deployer)

    // const tx = await stakingContractInstance.deposit({ value: ONE_UNIT.mul(1) })
    // parseLogs(await tx.wait(1))
    // const contractBalance = formatUnits(await stakingContractInstance.getTotalGLMR(), 18)
    // console.log('Contract balance : ', contractBalance)

    const tx1 = await stakingContractInstance.connect(nominator1).deposit({ value: ONE_UNIT.mul(10) })
    parseLogs(await tx1.wait(1))

    const tx2 = await stakingContractInstance.delegate(COLLATOR, ONE_UNIT.mul(11), gasParams)

    const txResult = await tx2.wait(1)

    console.log('BLOCK NUMBER :::::: ', await ethers.provider.getBlockNumber())
    console.log('Delay .....................')
    // await delay(100 * 600)
    // console.log('BLOCK NUMBER AFTER DELAY .... ', await ethers.provider.getBlockNumber())

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

    // await readSnapshot(stakingContractInstance)

    // const tx3 = await stakingContractInstance.schedule_revoke_delegation(COLLATOR, gasParams)
    // await tx3.wait(1)

    // const tx4 = await stakingContractInstance.execute_leave_delegators({
    //   gasLimit: '2000000',
    //   gasPrice: parseUnits('1', 'gwei')
    // })
    // //
    // await tx4.wait(1)

    // await readSnapshot(stakingContractInstance)

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
// TODO: Move to  utils/logParsers
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
