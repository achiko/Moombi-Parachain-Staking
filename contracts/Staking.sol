//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;


import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "./StakeToken.sol";
import "./StakingInterface.sol";
import "hardhat/console.sol";


contract Staking is StakeToken  {
    
    using SafeMath for uint256;

    StakeToken public sToken;
    ParachainStaking private stakingContract;
    
    // Mainnet Precompoled address is:  0x0000000000000000000000000000000000000800

    constructor(address _precompiled) payable {
        stakingContract = ParachainStaking(_precompiled);
        _mint(address(this), 1*10**18); // mint 1 token for contract ? s
    }   

    fallback() external payable { 
        console.log("FUNDS RECIVED: %s", msg.value);
    }


    // Deposit Function 

    // TODO: Add checks msg.value != 0 , 
    // TODO: Add modifier whenNotPaused (From zeppelin) 
    // TODO: What is share token ratio ? 
    
    function deposit() public payable {
        
        console.log(">>> Contract Balance: ", _getContractBalance());
        
        require(msg.value != 0, "WRONG DEPOSIT AMOUNT !");
        require(_getContractBalance() != 0, "NO RESERVE");
        
        // Total value of pool 
        uint256 totalSupply = totalSupply(); 
        // Lp Tokens Circulating supply
        uint256 contractBalance = _getContractBalance();
        console.log(">>> TotalSupply: ", totalSupply);

        uint256 lpTokenPrice = contractBalance.div(totalSupply);
        console.log(">>> 1 %s = %s DEV", symbol(), lpTokenPrice);
        // console.logUint(tokenPrice);

        uint tokenAmount = msg.value.div(lpTokenPrice);
        console.log(">>> Mint %s %s", tokenAmount, symbol());

        _mint(msg.sender, tokenAmount);
    }

    // function ratio() private returns(uint) {
    //     return 
    // }

    function getContractBalance() public view returns(uint) {
        return _getContractBalance();
    }

    function _getContractBalance() private view returns(uint) {
        return address(this).balance;
    }

    function isNominator(address _nominator) external view returns (bool) {
        return stakingContract.is_nominator(_nominator);
    }

    function collatorNominationCount(address _collator) external view returns (uint256) {
        return stakingContract.collator_nomination_count(_collator);
    }

    function isSelectedCandidate(address _collator) external view returns (bool) {
        return stakingContract.is_selected_candidate(_collator);
    }
    
    function nominate(
        address _collator,
        uint256 _amount
    ) external {

        address nominator = msg.sender;    

        uint256 _collatorNominationCount = stakingContract.collator_nomination_count(_collator);
        uint256 _nominatorNominationCount = stakingContract.nominator_nomination_count(nominator);

        stakingContract.nominate(_collator, _amount, _collatorNominationCount, _nominatorNominationCount);
    }
    
}
