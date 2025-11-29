// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title XToken
 * @dev ERC-20 token for Monad Micropayments & Loyalty Platform
 * This is the unified token used for P2P payments, loyalty rewards, and micro-subscriptions
 */
contract XToken is ERC20, Ownable {
    uint256 private constant INITIAL_SUPPLY = 1_000_000_000 * 10**18; // 1 billion tokens

    constructor(address initialOwner) ERC20("X Token", "XTK") Ownable(initialOwner) {
        // Mint initial supply to the contract owner (platform)
        _mint(initialOwner, INITIAL_SUPPLY);
    }

    /**
     * @dev Mint new tokens (only owner)
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    /**
     * @dev Batch mint tokens to multiple addresses (for airdrops)
     * @param recipients Array of recipient addresses
     * @param amounts Array of amounts to mint (must match recipients length)
     */
    function batchMint(address[] calldata recipients, uint256[] calldata amounts) public onlyOwner {
        require(recipients.length == amounts.length, "Arrays length mismatch");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            _mint(recipients[i], amounts[i]);
        }
    }
}


