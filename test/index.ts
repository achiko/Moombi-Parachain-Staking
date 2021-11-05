import hre, { ethers } from "hardhat";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { assert } from "chai";
import { deployErc20Token, Erc20Token } from "@thenextblock/hardhat-erc20";
import {
  CTokenDeployArg,
  deployCompoundV2,
  Comptroller,
} from "@thenextblock/hardhat-compound";
import "colors";

ethers.utils.Logger.setLogLevel(ethers.utils.Logger.levels.ERROR);

describe("Staking contract", function () {
  it("#1 Test ", async function () {
    const [deployer] = await ethers.getSigners();
    console.log("Deployer Address : ", await deployer.getAddress());

    // userA: borrow USDC
    // await cUSDC.connect(userA).borrow(parseUnits("123", 6));
  });
});
