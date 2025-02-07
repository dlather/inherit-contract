// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

/**
 * @title InheritContract
 * @dev A contract that allows the owner to transfer ownership to the heir after a delay.
 */
contract InheritContract {
    
    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    uint256 public constant OWNERSHIP_TRANSFER_DELAY = 30 days;

    address public owner;
    address public heir;
    uint256 public lastWithdrawalTimeStamp;
    
    // ************************************* //
    // *              Events               * //
    // ************************************* //

    event OwnershipTransferred(address indexed _previousOwner, address indexed _newOwner);
    event HeirUpdated(address indexed _previousHeir, address indexed _newHeir);
    event Withdrawal(address indexed _by, uint256 _amount);

    // ************************************* //
    // *              Modifiers            * //
    // ************************************* //

    modifier onlyOwner() {
        if (msg.sender != owner) revert OnlyOwnerCanCall();
        _;
    }

    modifier onlyHeir() {
        if (msg.sender != heir) revert OnlyHeirCanCall();
        _;
    }

    modifier enoughTimePassed() {
        if (block.timestamp - lastWithdrawalTimeStamp < OWNERSHIP_TRANSFER_DELAY) revert NotEnoughTimePassed();
        _;
    }

    // ************************************* //
    // *              Constructor         * //
    // ************************************* //

    /**
     * @dev Constructor sets the owner, heir and lastWithdrawalTimeStamp.
     * @param _heir The address of the heir.
     */
    constructor(address _heir) payable {
        if (_heir == address(0)) revert HeirCannotBeZeroAddress();

        owner = msg.sender;
        heir = _heir;
        lastWithdrawalTimeStamp = block.timestamp;

        emit OwnershipTransferred(address(0), owner);
        emit HeirUpdated(address(0), heir);
    }

    // ************************************* //
    // *              Functions            * //
    // ************************************* //

    /**
     * @dev Allows the owner to withdraw the specified amount of funds from the contract.
     * @param _amount The amount of funds to withdraw.
     */
    function withdraw(uint256 _amount) external onlyOwner {
        if (_amount > address(this).balance) revert NotEnoughBalance();
        
        lastWithdrawalTimeStamp = block.timestamp;
        if (_amount != 0) payable(owner).transfer(_amount);
        emit Withdrawal(owner, _amount);
    }

    /**
     * @dev Allows the owner to update the heir.
     * @param _newHeir The address of the new heir.
     */
    function updateHeir(address _newHeir) external onlyOwner {
        if (_newHeir == address(0)) revert HeirCannotBeZeroAddress();

        address _oldHeir = heir;
        heir = _newHeir;
        emit HeirUpdated(_oldHeir, heir);
    }

    /**
     * @dev Allows the heir to claim ownership of the contract after the owner has not interacted with the contract for over 1 month.
     * @param _newHeir The address of the new heir.
     */
    function claimOwnership(address _newHeir) external onlyHeir enoughTimePassed {
        if (_newHeir == address(0)) revert HeirCannotBeZeroAddress();

        address _oldOwner = owner;
        address _oldHeir = heir;
        owner = heir;
        heir = _newHeir;
        lastWithdrawalTimeStamp = block.timestamp;

        emit OwnershipTransferred(_oldOwner, owner);
        emit HeirUpdated(_oldHeir, heir);
    }

    // ************************************* //
    // *              Errors               * //
    // ************************************* //

    error OnlyOwnerCanCall();
    error OnlyHeirCanCall();
    error HeirCannotBeZeroAddress();
    error NotEnoughTimePassed();
    error NotEnoughBalance();
}
