// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SubscriptionScheduler
 * @notice Handles recurring and delayed payments with pre-approved allowances
 * @dev Vendors or backend can schedule payments that execute on due dates
 */
contract SubscriptionScheduler is Ownable {
    using SafeERC20 for IERC20;

    struct Subscription {
        address token;
        address payer;
        address recipient;
        uint256 amount;
        uint256 interval; // seconds between payments
        uint256 nextPaymentTime;
        uint256 totalPayments;
        uint256 paidCount;
        bool active;
    }

    mapping(uint256 => Subscription) public subscriptions;
    uint256 public subscriptionCount;
    mapping(address => uint256[]) public userSubscriptions;

    event SubscriptionCreated(
        uint256 indexed subscriptionId,
        address indexed payer,
        address indexed recipient,
        address token,
        uint256 amount,
        uint256 interval,
        uint256 nextPaymentTime
    );

    event PaymentExecuted(
        uint256 indexed subscriptionId,
        address indexed payer,
        address indexed recipient,
        uint256 amount,
        uint256 paymentNumber
    );

    event SubscriptionCancelled(uint256 indexed subscriptionId);
    event SubscriptionPaused(uint256 indexed subscriptionId);
    event SubscriptionResumed(uint256 indexed subscriptionId);

    constructor(address initialOwner) Ownable(initialOwner) {}

    /**
     * @notice Create a new subscription
     * @param token The ERC20 token address
     * @param recipient The recipient address
     * @param amount The amount per payment
     * @param interval The interval between payments in seconds
     * @param totalPayments Total number of payments (0 for unlimited)
     * @param startTime When to start the first payment (0 for immediate)
     */
    function createSubscription(
        address token,
        address recipient,
        uint256 amount,
        uint256 interval,
        uint256 totalPayments,
        uint256 startTime
    ) external returns (uint256) {
        require(recipient != address(0), "Invalid recipient");
        require(amount > 0, "Amount must be greater than 0");
        require(interval > 0, "Interval must be greater than 0");

        uint256 subscriptionId = subscriptionCount++;
        uint256 nextPayment = startTime > 0 ? startTime : block.timestamp;

        subscriptions[subscriptionId] = Subscription({
            token: token,
            payer: msg.sender,
            recipient: recipient,
            amount: amount,
            interval: interval,
            nextPaymentTime: nextPayment,
            totalPayments: totalPayments,
            paidCount: 0,
            active: true
        });

        userSubscriptions[msg.sender].push(subscriptionId);

        emit SubscriptionCreated(
            subscriptionId,
            msg.sender,
            recipient,
            token,
            amount,
            interval,
            nextPayment
        );

        return subscriptionId;
    }

    /**
     * @notice Execute a scheduled payment
     * @param subscriptionId The subscription ID
     */
    function executePayment(uint256 subscriptionId) external {
        Subscription storage sub = subscriptions[subscriptionId];
        require(sub.active, "Subscription not active");
        require(block.timestamp >= sub.nextPaymentTime, "Payment not due yet");
        require(
            sub.totalPayments == 0 || sub.paidCount < sub.totalPayments,
            "All payments completed"
        );

        IERC20 tokenContract = IERC20(sub.token);
        tokenContract.safeTransferFrom(
            sub.payer,
            sub.recipient,
            sub.amount
        );

        sub.paidCount++;
        sub.nextPaymentTime = sub.nextPaymentTime + sub.interval;

        // Auto-deactivate if all payments completed
        if (sub.totalPayments > 0 && sub.paidCount >= sub.totalPayments) {
            sub.active = false;
        }

        emit PaymentExecuted(
            subscriptionId,
            sub.payer,
            sub.recipient,
            sub.amount,
            sub.paidCount
        );
    }

    /**
     * @notice Execute multiple payments in batch
     * @param subscriptionIds Array of subscription IDs to execute
     */
    function executeBatchPayments(
        uint256[] calldata subscriptionIds
    ) external {
        for (uint256 i = 0; i < subscriptionIds.length; i++) {
            try this.executePayment(subscriptionIds[i]) {} catch {}
        }
    }

    /**
     * @notice Cancel a subscription (only by payer or owner)
     * @param subscriptionId The subscription ID
     */
    function cancelSubscription(uint256 subscriptionId) external {
        Subscription storage sub = subscriptions[subscriptionId];
        require(
            msg.sender == sub.payer || msg.sender == owner(),
            "Not authorized"
        );
        require(sub.active, "Already cancelled");

        sub.active = false;
        emit SubscriptionCancelled(subscriptionId);
    }

    /**
     * @notice Pause a subscription temporarily
     * @param subscriptionId The subscription ID
     */
    function pauseSubscription(uint256 subscriptionId) external {
        Subscription storage sub = subscriptions[subscriptionId];
        require(
            msg.sender == sub.payer || msg.sender == owner(),
            "Not authorized"
        );
        require(sub.active, "Not active");

        sub.active = false;
        emit SubscriptionPaused(subscriptionId);
    }

    /**
     * @notice Resume a paused subscription
     * @param subscriptionId The subscription ID
     */
    function resumeSubscription(uint256 subscriptionId) external {
        Subscription storage sub = subscriptions[subscriptionId];
        require(
            msg.sender == sub.payer || msg.sender == owner(),
            "Not authorized"
        );
        require(!sub.active, "Already active");

        // Adjust next payment time if it's in the past
        if (block.timestamp > sub.nextPaymentTime) {
            uint256 missedIntervals = (block.timestamp - sub.nextPaymentTime) /
                sub.interval;
            sub.nextPaymentTime =
                sub.nextPaymentTime +
                (missedIntervals + 1) *
                sub.interval;
        }

        sub.active = true;
        emit SubscriptionResumed(subscriptionId);
    }

    /**
     * @notice Get subscription details
     * @param subscriptionId The subscription ID
     */
    function getSubscription(
        uint256 subscriptionId
    ) external view returns (Subscription memory) {
        return subscriptions[subscriptionId];
    }

    /**
     * @notice Get all subscriptions for a user
     * @param user The user address
     * @return Array of subscription IDs
     */
    function getUserSubscriptions(
        address user
    ) external view returns (uint256[] memory) {
        return userSubscriptions[user];
    }

    /**
     * @notice Get subscriptions that are due for payment
     * @param limit Maximum number of subscriptions to return
     * @return Array of subscription IDs that are due
     */
    function getDueSubscriptions(
        uint256 limit
    ) external view returns (uint256[] memory) {
        uint256[] memory due = new uint256[](limit);
        uint256 count = 0;

        for (uint256 i = 0; i < subscriptionCount && count < limit; i++) {
            Subscription memory sub = subscriptions[i];
            if (
                sub.active &&
                block.timestamp >= sub.nextPaymentTime &&
                (sub.totalPayments == 0 || sub.paidCount < sub.totalPayments)
            ) {
                due[count] = i;
                count++;
            }
        }

        // Resize array
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = due[i];
        }

        return result;
    }
}

