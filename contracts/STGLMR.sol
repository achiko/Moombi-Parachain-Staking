//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract STGLMR is ERC20, Ownable {

    constructor() ERC20("STake Token", "sToken") {
        // console.log(">>> - Creating Token >>> ");
        // console.log(">>> - Who is calling ? %s", msg.sender);
        // console.log(">>> Token address : ", address(this));
    }
    
    // function mint(address to, uint256 amount) public onlyOwner  {
    //     console.log(">>> owner : ", owner());
    //     _mint(to, amount);
    // }
}