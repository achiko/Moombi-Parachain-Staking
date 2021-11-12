//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "./StakingInterface.sol";
// import "hardhat/console.sol";

contract Staking {
    
    ParachainStaking private staking;

    constructor() public {
        // console.log(">>>> Deploying Contract");
        staking = ParachainStaking(0x0000000000000000000000000000000000000800);
        // console.log(">>> Is Nominator? %s", staking.is_nominator(address(this)));
    }
    

    // TODO: code here 
}
