import { ethers } from "hardhat";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { assert } from "chai";
import { deployErc20Token, Erc20Token } from "@thenextblock/hardhat-erc20";
// import {
//   CTokenDeployArg,
//   deployCompoundV2,
//   Comptroller,
// } from "@thenextblock/hardhat-compound";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer address : ", await deployer.getAddress());
  // console.log("Deployer Balance : ", await deployer.getBalance());

  const Staking = await ethers.getContractFactory("Staking");
  console.log("Deploying Staking...");

  // Instantiating a new Box smart contract
  const staking = await Staking.deploy();
  await staking.deployed();
  console.log("Staking Deployed : ", staking.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
