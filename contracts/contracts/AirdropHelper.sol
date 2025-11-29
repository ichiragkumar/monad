// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title AirdropHelper
 * @dev Helper contract for batch token distributions
 * Allows vendors to distribute tokens to multiple recipients in a single transaction
 */
contract AirdropHelper {
    using SafeERC20 for IERC20;

    /**
     * @dev Distribute tokens to multiple recipients with equal amounts
     * @param token Address of the ERC-20 token contract
     * @param recipients Array of recipient addresses
     * @param amount Amount to send to each recipient
     */
    function airdropEqual(
        address token,
        address[] calldata recipients,
        uint256 amount
    ) external {
        IERC20 tokenContract = IERC20(token);
        
        for (uint256 i = 0; i < recipients.length; i++) {
            tokenContract.safeTransferFrom(msg.sender, recipients[i], amount);
        }
    }

    /**
     * @dev Distribute tokens to multiple recipients with varying amounts
     * @param token Address of the ERC-20 token contract
     * @param recipients Array of recipient addresses
     * @param amounts Array of amounts (must match recipients length)
     */
    function airdropVariable(
        address token,
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external {
        require(recipients.length == amounts.length, "Arrays length mismatch");
        
        IERC20 tokenContract = IERC20(token);
        
        for (uint256 i = 0; i < recipients.length; i++) {
            tokenContract.safeTransferFrom(msg.sender, recipients[i], amounts[i]);
        }
    }
}


