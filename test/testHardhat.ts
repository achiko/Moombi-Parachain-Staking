import hre, { ethers } from 'hardhat'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import { assert } from 'chai'
import { Staking__factory, Staking, MokStake__factory } from '../typechain'
import 'colors'
ethers.utils.Logger.setLogLevel(ethers.utils.Logger.levels.ERROR)

let COLLATOR = '0xf24FF3a9CF04c71Dbc94D0b566f7A27B94566cac'
let STAKING_CONTRACT_ADDRESS = ''

describe('Staking contract Local Hardhat Network', function () {
  it('# 1 Test sToken (local hardhat)', async function () {
    const [deployer, nominator] = await ethers.getSigners()
    const deployerAddress = await deployer.getAddress()
    console.log('Deployer address : ', deployerAddress)

    const mockPrecompiled = await new MokStake__factory(deployer).deploy()
    await mockPrecompiled.deployed()
    const precompiledMockContract = mockPrecompiled.address

    const stakingFactory = await new Staking__factory(deployer).deploy(precompiledMockContract)
    await stakingFactory.deployed()

    assert.equal(await stakingFactory.symbol(), 'sToken')
    await stakingFactory.deposit({ value: parseUnits('10', 18) })

    const genesisBalance = await stakingFactory.balanceOf(deployerAddress)
    console.log('genesis balance : ', genesisBalance.toString())
    // assert.isTrue(genesisBalance.eq(parseUnits('1', 18)), 'Wrong Genesis Price !!!')

    console.log(` ---- Nominator ---- `)
    await stakingFactory.connect(nominator).deposit({ value: parseUnits('1', 18) })
    const nominatorBalance1 = await stakingFactory.balanceOf(nominator.address)
    console.log(' Nomionator Balance : ', nominatorBalance1.toString())

    // await stakingFactory.connect(nominator).deposit({ value: parseUnits('1', 18) })
    // const nominatorBalance2 = await stakingFactory.balanceOf(nominator.address)
    // console.log(' Nomionator Balance : ', nominatorBalance2.toString())

    // await stakingFactory.connect(nominator).deposit({ value: parseUnits('1', 18) })
    // const nominatorBalance3 = await stakingFactory.balanceOf(nominator.address)
    // console.log(' Nomionator Balance : ', nominatorBalance3.toString(), 'Denom: ', formatUnits(nominatorBalance3, 18))

    // await deployer.sendTransaction({ to: stakingFactory.address, value: parseUnits('20', 18) })

    // await stakingFactory.connect(nominator).deposit({ value: parseUnits('20', 18) })
    // const nominatorBalance4 = await stakingFactory.balanceOf(nominator.address)
    // console.log(' Nomionator Balance : ', nominatorBalance4.toString(), 'Denom: ', formatUnits(nominatorBalance4, 18))

    assert(true)
  })
})
