import hre, { ethers } from 'hardhat'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import { assert } from 'chai'
import { Staking__factory, Staking, MokStake__factory } from '../typechain'
import 'colors'
ethers.utils.Logger.setLogLevel(ethers.utils.Logger.levels.ERROR)

let COLLATOR = '0xf24FF3a9CF04c71Dbc94D0b566f7A27B94566cac'
let STAKING_CONTRACT_ADDRESS = ''

describe('Staking contract', function () {
  it.skip('# 0 ...', async function () {
    const [deployer] = await ethers.getSigners()
    assert(true)
  })

  //TODO : Move this part to separate the LOCAL tests
  it.skip('# 1 Test sToken (local hardhat)', async function () {
    const [deployer, nominator] = await ethers.getSigners()
    const deployerAddress = await deployer.getAddress()
    console.log('Deployer address : ', deployerAddress)

    const mockPrecompiled = await new MokStake__factory(deployer).deploy()
    await mockPrecompiled.deployed()
    const precompiledMockContract = mockPrecompiled.address

    const stakingFactory = await new Staking__factory(deployer).deploy(precompiledMockContract)
    await stakingFactory.deployed()

    assert.equal(await stakingFactory.symbol(), 'sToken')
    await stakingFactory.deposit({ value: parseUnits('1', 18) })

    const genesisBalance = await stakingFactory.balanceOf(deployerAddress)
    assert.isTrue(genesisBalance.eq(parseUnits('1', 18)), 'Wrong Genesis Price !!!')

    console.log(` ---- Nominator ---- `)
    await stakingFactory.connect(nominator).deposit({ value: parseUnits('1', 18) })
    const nominatorBalance1 = await stakingFactory.balanceOf(nominator.address)
    console.log(' Nomionator Balance : ', nominatorBalance1.toString())

    await stakingFactory.connect(nominator).deposit({ value: parseUnits('1', 18) })
    const nominatorBalance2 = await stakingFactory.balanceOf(nominator.address)
    console.log(' Nomionator Balance : ', nominatorBalance2.toString())

    await stakingFactory.connect(nominator).deposit({ value: parseUnits('1', 18) })
    const nominatorBalance3 = await stakingFactory.balanceOf(nominator.address)
    console.log(' Nomionator Balance : ', nominatorBalance3.toString(), 'Denom: ', formatUnits(nominatorBalance3, 18))

    await deployer.sendTransaction({ to: stakingFactory.address, value: parseUnits('20', 18) })

    await stakingFactory.connect(nominator).deposit({ value: parseUnits('20', 18) })
    const nominatorBalance4 = await stakingFactory.balanceOf(nominator.address)
    console.log(' Nomionator Balance : ', nominatorBalance4.toString(), 'Denom: ', formatUnits(nominatorBalance4, 18))

    assert(true)
  })

  it('# 2 Deploy Staking Contract & Test Precompiled ', async function () {
    const [deployer, nominator] = await ethers.getSigners()

    console.log('Deployer Balance : ', formatUnits(await deployer.getBalance(), 18))
    const precompiledAddress = '0x0000000000000000000000000000000000000800'

    // const mockPrecompiled = await new MokStake__factory(deployer).deploy();
    // await mockPrecompiled.deployed();
    // const mockAdress = mockPrecompiled.address;

    const stakingFactory = await new Staking__factory(deployer).deploy(precompiledAddress)
    await stakingFactory.deployed()
    console.log('Staking Factory Address:', stakingFactory.address)

    STAKING_CONTRACT_ADDRESS = stakingFactory.address

    let isSelectedCandidate = await stakingFactory.isSelectedCandidate(COLLATOR)

    console.log(`Collator: ${COLLATOR} Is Selected Candidate :  ${isSelectedCandidate}`)

    const gasPrice = await ethers.provider.getGasPrice()
    console.log('Gas Price gwei : ', formatUnits(gasPrice, 'gwei'))
    console.log('gasPrice : ', gasPrice.toString())

    assert(true)
  })

  it('# 3 Work with existing Staking Contract ', async function () {
    // const [deployer, nominator] = await ethers.getSigners()
    // const instance = Staking__factory.connect(STAKING_CONTRACT_ADDRESS, deployer)
    // await instance.deposit({ value: parseUnits('100', 18) })
    // const contractBalance = formatUnits(await instance.getTotalGLMR(), 18)
    // console.log('Contract balance : ', contractBalance);

    // const amountToNominate = parseUnits('5', 18)
    // let tx = await instance.nominate(COLLATOR, amountToNominate, { gasLimit: '2000000', gasPrice: parseUnits('1', 'gwei') })
    // let result = await tx.wait()
    // console.log('status : ', result.status)

    // console.log('----------------- Revoke Nominator ---------------------- ')
    // let tx1 = await instance.revokeNomination(COLLATOR, { gasLimit: '2000000', gasPrice: parseUnits('1', 'gwei') })
    // let result1 = await tx1.wait()
    // console.log(result1)
    // console.log('status : ', result1.status)

    assert(true)
  })
})
