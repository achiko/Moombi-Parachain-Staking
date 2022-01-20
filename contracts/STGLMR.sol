//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract STGLMR is ERC20, Ownable {
    constructor() ERC20("Moonbeam Staking Token", "stGMLR") {
    }
}
