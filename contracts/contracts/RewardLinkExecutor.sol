// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

/**
 * @title RewardLinkExecutor
 * @notice Executes batch payments from signed EIP-712 payment links
 * @dev Allows backend to generate signed payment links that users can approve later
 */
contract RewardLinkExecutor is EIP712 {
    using SafeERC20 for IERC20;
    using ECDSA for bytes32;

    bytes32 private constant PAYMENT_LINK_TYPEHASH =
        keccak256(
            "PaymentLink(address token,address sender,address[] recipients,uint256[] amounts,uint256 nonce,uint256 expiry)"
        );

    mapping(address => uint256) public nonces;
    mapping(bytes32 => bool) public executedLinks;

    event PaymentLinkExecuted(
        address indexed sender,
        address indexed token,
        address[] recipients,
        uint256[] amounts,
        bytes32 linkHash
    );

    constructor() EIP712("RewardLinkExecutor", "1") {}

    /**
     * @notice Execute a batch payment from a signed payment link
     * @param token The ERC20 token address
     * @param sender The address that signed the payment link
     * @param recipients Array of recipient addresses
     * @param amounts Array of amounts to send (must match recipients length)
     * @param nonce Unique nonce to prevent replay attacks
     * @param expiry Timestamp after which the link expires
     * @param signature EIP-712 signature from the sender
     */
    function executeLink(
        address token,
        address sender,
        address[] calldata recipients,
        uint256[] calldata amounts,
        uint256 nonce,
        uint256 expiry,
        bytes calldata signature
    ) external {
        require(recipients.length == amounts.length, "Arrays length mismatch");
        require(block.timestamp <= expiry, "Payment link expired");
        require(nonce > nonces[sender], "Invalid nonce");

        // Create the hash of the payment link
        bytes32 structHash = keccak256(
            abi.encode(
                PAYMENT_LINK_TYPEHASH,
                token,
                sender,
                keccak256(abi.encodePacked(recipients)),
                keccak256(abi.encodePacked(amounts)),
                nonce,
                expiry
            )
        );

        bytes32 hash = _hashTypedDataV4(structHash);
        bytes32 linkHash = keccak256(abi.encodePacked(hash, signature));

        require(!executedLinks[linkHash], "Link already executed");
        require(
            ECDSA.recover(hash, signature) == sender,
            "Invalid signature"
        );

        // Mark as executed
        executedLinks[linkHash] = true;
        nonces[sender] = nonce;

        // Execute batch transfer
        IERC20 tokenContract = IERC20(token);
        for (uint256 i = 0; i < recipients.length; i++) {
            tokenContract.safeTransferFrom(sender, recipients[i], amounts[i]);
        }

        emit PaymentLinkExecuted(sender, token, recipients, amounts, linkHash);
    }

    /**
     * @notice Get the current nonce for a sender
     * @param sender The address to check
     * @return The current nonce
     */
    function getNonce(address sender) external view returns (uint256) {
        return nonces[sender];
    }

    /**
     * @notice Check if a payment link has been executed
     * @param linkHash The hash of the payment link
     * @return True if executed, false otherwise
     */
    function isLinkExecuted(bytes32 linkHash) external view returns (bool) {
        return executedLinks[linkHash];
    }
}

