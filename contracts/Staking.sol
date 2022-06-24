//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./STGLMR.sol";
import "./StakingInterface.sol";

import "hardhat/console.sol";

contract Staking is STGLMR {
    ParachainStaking public stakingContract;
    address public admin;
    bool public withdrawAllowed;

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

    constructor(address _precompiled) payable {
        stakingContract = ParachainStaking(_precompiled);
        admin = msg.sender;
        withdrawAllowed = false;
    }
    

    // TOTO: Only Owner or DAO
    function allowWithdrawal() public {
        withdrawAllowed = true;
    }


    function changePrecompiledContract(address _newPrecompiled) public onlyOwner {
        address _oldPrecompiled = address(stakingContract);
        stakingContract = ParachainStaking(_newPrecompiled);
        emit PrecompiledAddressChanged(_newPrecompiled, _oldPrecompiled);
    }

    ///////////////////////  Parachain Staking Part  //////////////////////

    function delegate(address _candidate, uint256 _amount) public onlyOwner {
        address delegator_ = address(this);
        totalStaked += _amount;

        uint256 candidateDelegationCount_ = stakingContract.candidate_delegation_count(_candidate);
        uint256 delegatorDelegationCount_ = stakingContract.delegator_delegation_count(delegator_);
        stakingContract.delegate(_candidate, _amount, candidateDelegationCount_, delegatorDelegationCount_);
        emit Nominate(msg.sender, delegator_, _candidate, candidateDelegationCount_, delegatorDelegationCount_, _amount);
    }

    // Increase Bound 
    // TODO: Add Modifier onlyOperational
    function delegatorBondMore(address _candidate, uint256 _more) public onlyOwner  {
        totalStaked += _more;
        stakingContract.delegator_bond_more(_candidate, _more);
    }

    // schedule_revoke_delegation
    // TODO : Add Modifier onlyOperational
    function scheduleDelegatorBondLess(address _candidate, uint256 _less) public onlyOwner  {
        totalUnstaked += _less;
        stakingContract.schedule_delegator_bond_less(_candidate, _less);    
    }

    // TODO: Add Modifier: onlyOperational
    function executeCandidateBondLess(address _candidate) public onlyOwner  {
        stakingContract.execute_candidate_bond_less(_candidate);
    }
    
    // Revoke Delegation    
    // Add Modifier: onlyShutdown 
    function scheduleRevokeDelegation(address _candidate) public  {
        stakingContract.schedule_revoke_delegation(_candidate);
    }

    function executeDelegationRequest(address _candidate) public {
        address delegator = address(this);
        stakingContract.execute_delegation_request(delegator,_candidate);
    }

    /// @dev Join the set of collator candifdates
    /// @param _amount The amount self-bonded by the caller to become a collator candidate
    function joinCandidates(uint256 _amount) external onlyOwner {
        uint256 candidateCount_ = stakingContract.candidate_count();
        stakingContract.join_candidates(_amount, candidateCount_);
    }
    
    /// @dev Get the CandidateDelegationCount weight hint
    /// @param _candidate The address for which we are querying the nomination count
    /// @return The number of nominations backing the collator
    function candidateDelegationCount(address _candidate) external view returns (uint256) {
        return stakingContract.candidate_delegation_count(_candidate);
    }

    /// @dev Check whether the specified address is currently a staking delegator
    /// @param _delegator the address that we want to confirm is a delegator
    /// @return A boolean confirming whether the address is a delegator
    function isDelegator(address _delegator) external view returns (bool) {
        return stakingContract.is_delegator(_delegator);
    }

    /// @dev Total points awarded to all collators in a particular round
    /// @param _round the round for which we are querying the points total
    /// @return The total points awarded to all collators in the round
    function points(uint _round) external view returns(uint256) {
        return stakingContract.points(_round);
    }

    // function shutdown() onlyOwner {
    //     state = STATE_SHUTDOWN;
    // }
}
