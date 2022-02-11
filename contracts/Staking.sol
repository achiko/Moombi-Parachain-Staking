//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./STGLMR.sol";
import "./StakingInterface.sol";

import "hardhat/console.sol";

contract Staking is STGLMR {
    ParachainStaking private stakingContract;
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

    // TODO: Add change precompiled contract instance
    // TODO: Add OnlyAdmin
    function changePrecompiledContract(address _newPrecompiled) public {
        address _oldPrecompiled = address(stakingContract);
        stakingContract = ParachainStaking(_newPrecompiled);
        emit PrecompiledAddressChanged(_newPrecompiled, _oldPrecompiled);
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
