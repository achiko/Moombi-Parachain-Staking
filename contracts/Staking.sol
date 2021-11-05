//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./StakingInterface.sol";

import "hardhat/console.sol";

contract Staking {
    
    ParachainStaking private staking;

    constructor() public {
        console.log(">>>> Deploying Local Contract");
        staking = ParachainStaking(0x0000000000000000000000000000000000000800);
    }

    // function cTokens() public view returns (string memory) {
    //     address[] memory cTokens = comptroller.getAllMarkets();
    //     uint len = cTokens.length;
    //     for (uint i = 0; i < len; i++) {
    //         CTokenInterface cToken = CTokenInterface(cTokens[i]);
    //         console.log('>>>> cToken Name : %s', cToken.name());
    //     }
    // }

    // TODO: code here 
}
