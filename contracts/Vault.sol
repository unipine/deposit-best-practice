//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract Vault {
    using SafeERC20 for IERC20;

    /// @dev token => user => balance
    mapping(IERC20 => mapping(address => uint256)) public balanceOf;

    /// @dev array of active users who have deposited on the vault at least once
    address[] private users;

    /**
     * @notice Event emitted when deposit tokens on the vault
     * @param token token address to deposit
     * @param from depositor's address
     * @param amount deposited amount of token
     */
    event Deposit(IERC20 indexed token, address indexed from, uint256 amount);

    /**
     * @notice Event emitted when withdraw from the vault
     * @param token token address to withdraw
     * @param to withdrawer's address
     * @param amount withdrawn amount
     */
    event Withdraw(IERC20 indexed token, address indexed to, uint256 amount);

    /**
     * @notice External view function that returns top 2 users with the most of funds in the pool
     * @param token token address of pool
     * @return top1User top #1 user
     * @return top2User top #2 user
     */
    function topUsers(IERC20 token)
        external
        view
        returns (address top1User, address top2User)
    {
        for (uint256 i = 0; i < users.length; i++) {
            address user = users[i];
            uint256 userBalance = balanceOf[token][user];

            if (userBalance > 0) {
                if (userBalance > balanceOf[token][top1User]) {
                    top2User = top1User;
                    top1User = user;
                } else if (userBalance > balanceOf[token][top2User]) {
                    top2User = user;
                }
            }
        }
    }

    /**
     * @notice External function that deposits tokens to the vault
     * @dev Emit Deposit event when success
     * @param token token address to deposit
     * @param amount amount of token to deposit
     */
    function deposit(IERC20 token, uint256 amount) external {
        require(amount > 0, "invalid amount");

        token.safeTransferFrom(msg.sender, address(this), amount);

        if (balanceOf[token][msg.sender] == 0) {
            users.push(msg.sender);
        }
        balanceOf[token][msg.sender] += amount;

        emit Deposit(token, msg.sender, amount);
    }

    /**
     * @notice External function that withdraws tokens from the vault
     * @dev Emit Withdraw event when success
     * @param token token address to withdraw
     * @param amount amount of token to withdraw
     */
    function withdraw(IERC20 token, uint256 amount) external {
        require(
            amount > 0 && balanceOf[token][msg.sender] >= amount,
            "invalid amount"
        );

        balanceOf[token][msg.sender] -= amount;
        token.safeTransfer(msg.sender, amount);

        emit Withdraw(token, msg.sender, amount);
    }
}
