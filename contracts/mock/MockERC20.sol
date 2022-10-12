// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20("Mock", "MCT") {
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
