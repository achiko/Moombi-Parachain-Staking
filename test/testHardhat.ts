import hre, { ethers } from 'hardhat'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import { assert } from 'chai'
import { Staking__factory, Staking, MokStake__factory } from '../typechain'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import 'colors'
import { BigNumber } from 'ethers'
ethers.utils.Logger.setLogLevel(ethers.utils.Logger.levels.ERROR)

let COLLATOR = '0xf24FF3a9CF04c71Dbc94D0b566f7A27B94566cac'
let STAKING_CONTRACT_ADDRESS = ''

let staking: Staking

async function balanceOf(signer: SignerWithAddress): Promise<BigNumber> {
  return await staking.balanceOf(signer.address)
}

describe('Staking contract Local Hardhat Network', function () {
  it('# 1 Test sToken (local hardhat)', async function () {
    const [deployer, nominator, nominator1, nominator2] = await ethers.getSigners()
    const deployerAddress = await deployer.getAddress()
    console.log('Deployer address : ', deployerAddress)

    const mockPrecompiled = await new MokStake__factory(deployer).deploy()
    await mockPrecompiled.deployed()
    const precompiledMockContract = mockPrecompiled.address

    staking = await new Staking__factory(deployer).deploy(precompiledMockContract)
    await staking.deployed()

    assert.equal(await staking.symbol(), 'stGLMR')

    console.log(` ---- Nominator ---- `)
    await staking.connect(nominator).deposit({ value: parseUnits('10', 18) })
    const nominatorBalance1 = await balanceOf(nominator)

    console.log(' Nominator1 Balance : ', formatUnits(nominatorBalance1, 18))
    console.log(' TotalSupply 1: ', formatUnits(await staking.totalSupply(), 18))
    console.log('------------------')

    await staking.connect(nominator1).deposit({ value: parseUnits('10', 18) })
    const nominatorBalance2 = await balanceOf(nominator1)

    console.log(' Nominator2 Balance : ', formatUnits(nominatorBalance2, 18))
    console.log(' TotalSupply 2: ', formatUnits(await staking.totalSupply(), 18))
    console.log('------')

    await staking.connect(nominator2).deposit({ value: parseUnits('30', 18) })
    const nominatorBalance3 = await balanceOf(nominator2)

    console.log(' Nominator3 Balance : ', formatUnits(nominatorBalance3, 18))
    console.log('TotalSupp3: ', formatUnits(await staking.totalSupply(), 18))
    console.log('------')

    assert(true)
  })
})
