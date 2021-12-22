//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;


import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "./STGLMR.sol";
import "./StakingInterface.sol";
import "hardhat/console.sol";


contract Staking is STGLMR  {
    
    using SafeMath for uint256;
    using SafeMath for uint;

    uint public totalStaked;
    uint public totalRewarded;
    address public admin;
    bool public withdrawAllowed;
    ParachainStaking private stakingContract;

    event Nominate(address indexed _from, address indexed _nominator, address indexed _collator,  uint _collatorNominationCount,  uint __nominatorNominationCount, uint _amount);
    event RevokeNomination(address indexed _from, address indexed _collator);
    event PrecompiedContractChanged(address indexed _newPrecompiled, address indexed _oldPrecompiled);

    // Mainnet Precompoled address is:  0x0000000000000000000000000000000000000800

    constructor(address _precompiled) payable {
        stakingContract = ParachainStaking(_precompiled);
        totalStaked = 0;
        totalRewarded = 0;
        admin = msg.sender;
        withdrawAllowed = false;
        _mint(address(this), 1*10**18); // mint 1 token for contract ? s
    }

    // TOTO: Only Owner or DAO 
    function allowWithdrawal() public {
        withdrawAllowed = true;
    }

    // TODO: Add change precompiled contract instance 
    // TODO: Add onlyAdmin
    function changePrecompiledContract(address _newPrecompiled) public {
        address _oldPrecompiled = address(stakingContract);
        stakingContract = ParachainStaking(_newPrecompiled);
        emit PrecompiedContractChanged(_newPrecompiled, _oldPrecompiled);
    }


    function getTotalGLMR() public view returns (uint256) {
	    uint totalGlmr = _getTotalGLMR();
	    return totalGlmr;
    }

    function _getTotalGLMR() private view returns(uint) {
        return totalStaked;
    }

    // Ovverride classic BalanceOf function 
    function balanceOf(address _account) public view override returns (uint256) {
        uint256 accountBalance = super.balanceOf(_account);
        return accountBalance;
    }


    // Deposit Function 
    // TODO: Add checks msg.value != 0 , 
    // TODO: Add modifier whenNotPaused (From zeppelin) 
    // TODO: What is share token ratio ? 
    
    function deposit() public payable {
        
        require(msg.value != 0, "WRONG DEPOSIT AMOUNT !");
        // require(_getTotalGLMR(); != 0, "NO RESERVE");

        totalStaked += msg.value;
        console.log("Total Staked: %s", totalStaked);
        
        // LP tokens total supply
        uint256 totalSupply = totalSupply(); 
        // console.log(">>> TotalSupply: ", totalSupply);

        // Lp Tokens Circulating supply
        uint256 totalGLMR = _getTotalGLMR();
        // console.log(">>> totalGlmr: ", totalGLMR);
        
        uint256 tokenPrice = totalGLMR/totalSupply;

        uint tokenAmount = msg.value/tokenPrice;

        _mint(msg.sender, tokenAmount);
    }


    // TODO: withdraw must be disabled 
    function withdraw(uint _amount) external {
        require(msg.sender == admin, "ONLY ADMIN CAN WITHDRAW");
        address sender = msg.sender;
        // This is the current recommended method to use.
        (bool sent, ) = sender.call{value: _amount}("");
        require(sent, "Failed to send Funds ");
    }
    

    // TODO: Research falback & receive

    // fallback() external payable { 
    //     // ?? Deposit ? ?? 
    // }

    // receive() external payable { 
    //     deposit();
    // }



    
    function nominate(
        address _collator,
        uint256 _amount
    ) external {

        address nominator = address(this);
        uint256 _collatorNominationCount = stakingContract.collator_nomination_count(_collator);
        uint256 _nominatorNominationCount = stakingContract.nominator_nomination_count(nominator);
        stakingContract.nominate(_collator, _amount, _collatorNominationCount, _nominatorNominationCount);

        emit Nominate(msg.sender, nominator, _collator, _collatorNominationCount, _nominatorNominationCount, _amount);
    }


    function revokeNomination(address _collator) external {
        stakingContract.revoke_nomination(_collator);
        emit RevokeNomination(msg.sender, _collator);
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

}
