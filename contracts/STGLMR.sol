//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract STGLMR is IERC20, Ownable {

    uint256 public totalDeposited;
    uint256 public totalStaked;
    uint256 public totalRewarded;
    uint256 public totalUnstaked;

    uint8 public state = 0;

    // public const STATE_OPERATIONAL = 0;
    // const STATE_SHUTDOWN = 1;
    // const STATE_WITHDRAWAL = 2;
    
    uint256 public totalShares;

    /**
     * @dev StGLMR balances are dynamic and are calculated based on the accounts' shares
     * and the total amount of GLMR controlled by the protocol. Account shares aren't
     * normalized, so the contract also stores the sum of all shares to calculate
     * each account's token balance which equals to:
     *
     *   shares[account] * _getTotalPooledGLMR() / _getTotalShares()
    */
    mapping (address => uint256) private shares;

    /**
     * @dev Allowances are nominated in tokens, not token shares.
     */
    mapping (address => mapping (address => uint256)) private allowances;


    event Deposit(address indexed _from, uint256 _amount);

    /**
    * @dev Returns the name of the token.
     */
    function name() public pure returns (string memory) {
        return "Staked GLMR";
    }

    /**
     * @dev Returns the symbol of the token, usually a shorter version of the
     * name.
     */
    function symbol() public pure returns (string memory) {
        return "stGLMR";
    }

    /**
     * @dev Returns the number of decimals used to get its user representation.
     */
    function decimals() public pure returns (uint8) {
        return 18;
    }

    /**
     * @return the amount of tokens in existence.
     *
     * @dev Always equals to `_getTotalPooledEther()` since token amount
     * is pegged to the total amount of Ether controlled by the protocol.
     */
    function totalSupply() public view override returns (uint256) {
        return _getTotalPooledGLMR();
    }

    /**
     * @return the amount of shares owned by `_account`.
     */
    function _sharesOf(address _account) internal view returns (uint256) {
        return shares[_account];
    }

    function balanceOf(address _account) public view override returns (uint256) {
        return getPooledGLMRByShares(_sharesOf(_account));
        // uint256 userBalance = shares[account] * _getTotalPooledGLMR() / _getTotalShares();
        // return userBalance;
    }

    /**
     * @notice Moves `_sharesAmount` shares from `_sender` to `_recipient`.
     *
     * Requirements:
     *
     * - `_sender` cannot be the zero address.
     * - `_recipient` cannot be the zero address.
     * - `_sender` must hold at least `_sharesAmount` shares.
     * - the contract must not be paused.
     */
    function _transferShares(address _sender, address _recipient, uint256 _sharesAmount) internal {
        require(_sender != address(0), "TRANSFER_FROM_THE_ZERO_ADDRESS");
        require(_recipient != address(0), "TRANSFER_TO_THE_ZERO_ADDRESS");

        uint256 currentSenderShares = shares[_sender];
        require(_sharesAmount <= currentSenderShares, "TRANSFER_AMOUNT_EXCEEDS_BALANCE");

        shares[_sender] = currentSenderShares - _sharesAmount;
        shares[_recipient] = shares[_recipient] + _sharesAmount;
    }


    /**
     * @return the remaining number of tokens that `_spender` is allowed to spend
     * on behalf of `_owner` through `transferFrom`. This is zero by default.
     *
     * @dev This value changes when `approve` or `transferFrom` is called.
     */
    function allowance(address _owner, address _spender) public view override returns (uint256) {
        return allowances[_owner][_spender];
    }

    /**
     * @notice Sets `_amount` as the allowance of `_spender` over the caller's tokens.
     *
     * @return a boolean value indicating whether the operation succeeded.
     * Emits an `Approval` event.
     *
     * Requirements:
     *
     * - `_spender` cannot be the zero address.
     * - the contract must not be paused.
     *
     * @dev The `_amount` argument is the amount of tokens, not shares.
     */
    function approve(address _spender, uint256 _amount) public override returns (bool) {
        _approve(msg.sender, _spender, _amount);
        return true;
    }

    /**
     * @notice Sets `_amount` as the allowance of `_spender` over the `_owner` s tokens.
     *
     * Emits an `Approval` event.
     *
     * Requirements:
     *
     * - `_owner` cannot be the zero address.
     * - `_spender` cannot be the zero address.
     * - the contract must not be paused.
     */
    function _approve(address _owner, address _spender, uint256 _amount) internal {
        require(_owner != address(0), "APPROVE_FROM_ZERO_ADDRESS");
        require(_spender != address(0), "APPROVE_TO_ZERO_ADDRESS");

        allowances[_owner][_spender] = _amount;
        emit Approval(_owner, _spender, _amount);
    }

    /**
     * @notice Moves `_amount` tokens from the caller's account to the `_recipient` account.
     *
     * @return a boolean value indicating whether the operation succeeded.
     * Emits a `Transfer` event.
     *
     * Requirements:
     *
     * - `_recipient` cannot be the zero address.
     * - the caller must have a balance of at least `_amount`.
     * - the contract must not be paused.
     *
     * @dev The `_amount` argument is the amount of tokens, not shares.
     */
    function transfer(address _recipient, uint256 _amount) public override returns (bool) {
        _transfer(msg.sender, _recipient, _amount);
        return true;
    }

    /**
     * @notice Moves `_amount` tokens from `_sender` to `_recipient`.
     * Emits a `Transfer` event.
     */
    function _transfer(address _sender, address _recipient, uint256 _amount) internal {
        uint256 _sharesToTransfer = getSharesByPooledGLMR(_amount);
        _transferShares(_sender, _recipient, _sharesToTransfer);
        emit Transfer(_sender, _recipient, _amount);
    }

    /**
    * @notice Moves `_amount` tokens from `_sender` to `_recipient` using the
     * allowance mechanism. `_amount` is then deducted from the caller's
     * allowance.
     *
     * @return a boolean value indicating whether the operation succeeded.
     *
     * Emits a `Transfer` event.
     * Emits an `Approval` event indicating the updated allowance.
     *
     * Requirements:
     *
     * - `_sender` and `_recipient` cannot be the zero addresses.
     * - `_sender` must have a balance of at least `_amount`.
     * - the caller must have allowance for `_sender`'s tokens of at least `_amount`.
     * - the contract must not be paused.
     *
     * @dev The `_amount` argument is the amount of tokens, not shares.
     */
    function transferFrom(address _sender, address _recipient, uint256 _amount) public override returns (bool) {
        uint256 currentAllowance = allowances[_sender][msg.sender];
        require(currentAllowance >= _amount, "AMOUNT_EXCEEDS_ALLOWANCE");

        _transfer(_sender, _recipient, _amount);
        _approve(_sender, msg.sender, currentAllowance - _amount );
        return true;
    }


    /// @dev Get Contract GLMR Balance 
    /// @return The GLMR Balance 
    function getGLMRBalance() external view returns(uint) {
        return address(this).balance;
    }

    /**
    * @dev Gets The Total Shares
    * @return total shares wei
    */
    function _getTotalShares() internal view returns (uint256) {
        return totalShares;
    }
    

    function _getTotalrewarded() internal view returns(uint256) {
        return address(this).balance + totalStaked - totalUnstaked - totalDeposited;
    }

    /**
    * @dev Gets the total amount of GLMR controlled by the system
    * @return total balance in wei
    */
    // TODO: This function need to be modified and testsd carefully 
    function _getTotalPooledGLMR() internal view returns (uint256) {
        return totalDeposited;
        // if(totalStaked < totalDeposited) {
        //     //totalRewarded = (address(this).balance + (totalStaked - totalUnstaked) ) - totalDeposited;
        //     return totalDeposited + totalRewarded - (totalStaked - totalUnstaked);
        // }else{
        //     return totalStaked + totalRewarded - totalDeposited + totalUnstaked;
        // }
    }


    /**
     * @return the amount of shares that corresponds to `_ethAmount` protocol-controlled Ether.
     */
    function getSharesByPooledGLMR(uint256 _amount) public view returns (uint256) {
        uint256 totalPooledGLMR = _getTotalPooledGLMR();
        if (totalPooledGLMR == 0) {
            return 0;
        } else {
            return (_amount * _getTotalShares())  / (totalPooledGLMR);
        }
    }

    /**
     * @return the amount of Ether that corresponds to `_sharesAmount` token shares.
     */
    function getPooledGLMRByShares(uint256 _sharesAmount) public view returns (uint256) {
        uint256 _totalShares = _getTotalShares();
        if (totalShares == 0) {
            return 0;
        } else {
            return (_sharesAmount * _getTotalPooledGLMR()) / _totalShares;
        }
    }


    receive() external payable { 
        // console.log("SM--> tx.gasleft: %", gasleft());
        totalRewarded += msg.value; 
        // console.log("SM--> tx.gasleft: %", gasleft());
    }

    fallback() external payable { 
        totalRewarded += msg.value; 
    }

    function getTotalRewardedGLMR() public view returns (uint256) {
        return totalRewarded;
    }


    // Deposit
    // TODO: Add modifier whenNotPaused (From zeppelin)
    // TODO: Add onlyOperational modyfier
    function deposit() public payable returns (uint256) {
        require(msg.value != 0, "WRONG DEPOSIT AMOUNT !");

        address sender = msg.sender;
        uint256 _deposit = msg.value;

        uint256 sharesAmount = getSharesByPooledGLMR(_deposit);

        if(sharesAmount == 0) {
            sharesAmount = _deposit;
        }
        
        _mintShares(sender, sharesAmount);
        //  _submitted(sender, deposit, _referral);
        // _emitTransferAfterMintingShares(sender, sharesAmount);

        totalDeposited += _deposit;
        
        return sharesAmount;
    }

    /**
     * @notice Creates `_sharesAmount` shares and assigns them to `_recipient`, increasing the total amount of shares.
     * @dev This doesn't increase the token total supply.
     *
     * Requirements:
     *
     * - `_recipient` cannot be the zero address.
     * - the contract must not be paused.
     */
    function _mintShares(address _recipient, uint256 _sharesAmount) internal returns (uint256 newTotalShares) {
        require(_recipient != address(0), "MINT_TO_THE_ZERO_ADDRESS");

        newTotalShares = _getTotalShares() + _sharesAmount;
        totalShares = newTotalShares;
        shares[_recipient] = shares[_recipient] + _sharesAmount;
    }

}
