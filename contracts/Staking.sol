//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./STGLMR.sol";
import "./StakingInterface.sol";
import "hardhat/console.sol";

contract Staking is STGLMR {
    using SafeMath for uint256;
    using SafeMath for uint256;

    uint256 public totalDeposited;
    uint256 public totalStaked;
    uint256 public totalRewarded;

    address public admin;
    bool public withdrawAllowed;
    ParachainStaking private stakingContract;

    event Deposit(address indexed _from, uint256 _amount);

    //msg.sender, delegator, _candidate, candidateDelegationCount, delegatorDelegationCount, _amount
    event Nominate(
        address indexed _from,
        address indexed _delegator,
        address indexed _candidate,
        uint256 _candidateDelegationCount,
        uint256 _delegatorDelegationCount,
        uint256 _amount
    );
    event RevokeNomination(address indexed _from, address indexed _collator);
    event PrecompiledAddressChanged(address indexed _newPrecompiled, address indexed _oldPrecompiled);
    event WithdrawGLMR(address indexed _from, uint _amount);

    // Mainnet Precompiled address is:  0x0000000000000000000000000000000000000800

    constructor(address _precompiled) payable {
        stakingContract = ParachainStaking(_precompiled);
        totalStaked = 0;
        totalRewarded = 0;
        totalDeposited = msg.value;
        admin = msg.sender;
        withdrawAllowed = false;
        _mint(address(this), 1 * 10**18); // mint 1 token to avoid division by zero in deposit function
    }

    /**
     * @notice Get a snapshot of Staking contract
     * @dev Used for external view
     * @return (TotalGLMR, _totalDeposited, _totalStaked, _totalRewarded)
     */
    function getContractSnapshot() external view returns (uint,uint,uint,uint) {
            return (getTotalGLMR(), totalDeposited, totalStaked, totalRewarded );
    }

    // TOTO: Only Owner or DAO
    function allowWithdrawal() public {
        withdrawAllowed = true;
    }

    // TODO: Add change precompiled contract instance
    // TODO: Add OnlyAdmin

    function changePrecompiledContract(address _newPrecompiled) public {
        address _oldPrecompiled = address(stakingContract);
        stakingContract = ParachainStaking(_newPrecompiled);
        emit PrecompiledAddressChanged(_newPrecompiled, _oldPrecompiled);
    }

    function getTotalGLMR() public view returns (uint256) {
        return _getTotalGLMR();
    }

    /// TotalGLMR = SmartcontractBalance + StakedAmount
    function _getTotalGLMR() private view returns (uint256) {
        return address(this).balance;
        // return address(this).balance + totalStaked;
    }

    // Override classic BalanceOf function
    // This Function will return User Balance
    function balanceOf(address _account) public view override returns (uint256) {
        uint256 userTokens = super.balanceOf(_account);
        uint256 share = userTokens / totalSupply();
        uint256 userGLMR = _getTotalGLMR() * share;
        return userGLMR;
    }

    // return exact Amount of stGLMR
    function tokenBalance(address _account) public view returns (uint256) {
        uint256 userTokens = super.balanceOf(_account);
        return userTokens;
    }


    event DepositSnapShot(
        address indexed from,
        uint256 blockNumber,
        uint256 totalDeposited,
        uint256 totalSupply,
        uint256 totalGLMR,
        uint256 tokenPrice,
        uint256 tokenAmount
    );

    // Deposit Function
    // TODO: Add modifier whenNotPaused (From zeppelin)
    function deposit() public payable {
        require(msg.value != 0, "WRONG DEPOSIT AMOUNT !");
        require(_getTotalGLMR() != 0, "NO RESERVE");

        uint256 depositAmount = msg.value;
        totalDeposited.add(depositAmount);
        
        uint256 _totalSupply = totalSupply();

        uint256 _totalGLMR = _getTotalGLMR();

        uint256 tokenPrice = _totalGLMR / _totalSupply;

        uint256 tokenAmount = depositAmount / tokenPrice;

        emit DepositSnapShot(msg.sender,block.number,totalDeposited,_totalSupply,_totalGLMR,tokenPrice,tokenAmount);

        emit Deposit(msg.sender, msg.value);
        
        _mint(msg.sender, tokenAmount);
    }

    // TODO: withdraw must be disabled
    function withdraw(uint256 _amount) external {
        address sender = msg.sender;
        require(sender == admin, "ONLY ADMIN CAN WITHDRAW");
        // This is the current recommended method to use.
        (bool sent, ) = sender.call{value: _amount}("");
        require(sent, "Failed to send Funds ");
        emit WithdrawGLMR(sender, _amount);
    }


    ///////////////////////  Parachain Staking Part  //////////////////////

    function delegate(address _candidate, uint256 _amount) external {
        address delegator = address(this);

        uint256 candidateDelegationCount = stakingContract.candidate_delegation_count(_candidate);
        uint256 delegatorDelegationCount = stakingContract.delegator_delegation_count(delegator);
        stakingContract.delegate(_candidate, _amount, candidateDelegationCount, delegatorDelegationCount);

        emit Nominate(msg.sender, delegator, _candidate, candidateDelegationCount, delegatorDelegationCount, _amount);
    }


    // This function should leave all delegations -- testing mode
    function leaveDelegations() public {
        stakingContract.schedule_leave_delegators();
        uint256 delegatorDelegationCount = stakingContract.delegator_delegation_count(address(this));
        stakingContract.execute_leave_delegators(delegatorDelegationCount);
    }

    function schedule_revoke_delegation(address _candidate) public {
        stakingContract.schedule_revoke_delegation(_candidate);
    }

    function is_delegator(address _nominator) external view returns (bool) {
        return stakingContract.is_nominator(_nominator);
    }

    function candidate_delegation_count(address _collator) external view returns (uint256) {
        return stakingContract.candidate_delegation_count(_collator);
    }

    function is_selected_candidate(address _collator) external view returns (bool) {
        return stakingContract.is_selected_candidate(_collator);
    }
}
