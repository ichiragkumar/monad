# Batch Transactions & Delayed Payments Implementation

This document describes the implementation of batch transactions and delayed/programmable payments on the Monad Micropayments Platform.

## 🎯 Features Implemented

### 1. **Batch Transactions via Payment Links**
- **Smart Contract**: `RewardLinkExecutor.sol`
- **Frontend Component**: `PaymentLinkHandler.tsx`
- **Hook**: `usePaymentLink.ts`
- **Utilities**: `eip712.ts`

**How it works:**
1. Backend or vendor generates a signed EIP-712 payment link
2. Link contains: recipients, amounts, nonce, expiry
3. User opens link at `/approve-payment`
4. User reviews and approves the batch payment
5. Transaction executes on-chain

**Use Cases:**
- Event reward distributions
- Batch tipping multiple creators
- Vendor-initiated airdrops

### 2. **Recurring & Delayed Payments (Subscriptions)**
- **Smart Contract**: `SubscriptionScheduler.sol`
- **Frontend Component**: `SubscriptionManager.tsx`
- **Hook**: `useSubscriptions.ts`

**How it works:**
1. User creates a subscription with:
   - Recipient address
   - Amount per payment
   - Interval (e.g., 30 days)
   - Total payments (0 for unlimited)
   - Start time (0 for immediate)
2. Payments execute automatically when due
3. User can pause, resume, or cancel subscriptions

**Use Cases:**
- Monthly subscription payments
- Recurring donations
- Scheduled payroll
- Delayed payments

## 📁 File Structure

### Smart Contracts
```
contracts/contracts/
├── RewardLinkExecutor.sol      # EIP-712 signed payment links
└── SubscriptionScheduler.sol   # Recurring/delayed payments
```

### Frontend Components
```
src/components/
├── PaymentLinkHandler.tsx       # Payment link approval UI
├── PaymentLinkHandler.css
├── SubscriptionManager.tsx      # Subscription management UI
└── SubscriptionManager.css
```

### Hooks & Utilities
```
src/hooks/
├── usePaymentLink.ts           # Payment link execution hook
└── useSubscriptions.ts         # Subscription management hook

src/utils/
└── eip712.ts                   # EIP-712 signing utilities
```

## 🚀 Usage Examples

### Creating a Payment Link (Backend)

```typescript
import { createPaymentLinkTypedData, generatePaymentLinkUrl } from '@/utils/eip712'

const paymentData = {
  token: TOKEN_CONTRACT_ADDRESS,
  sender: userAddress,
  recipients: ['0x...', '0x...'],
  amounts: ['10', '20', '30'],
  nonce: 1,
  expiry: Math.floor(Date.now() / 1000) + 86400, // 24 hours
}

// Generate URL
const linkUrl = generatePaymentLinkUrl('https://app.domain.xyz', paymentData)
// Send via email/QR/DM
```

### Creating a Subscription (Frontend)

```typescript
const { createSubscription } = useSubscriptions()

await createSubscription(
  '0x...',           // recipient
  '100',             // amount per payment
  2592000,           // interval: 30 days in seconds
  12,                // total payments: 12 months
  0                  // start time: immediate
)
```

### Executing a Payment Link (Frontend)

Users navigate to `/approve-payment?token=...&sender=...&recipients=...&amounts=...&nonce=...&expiry=...`

The `PaymentLinkHandler` component automatically:
1. Parses the URL parameters
2. Validates the link (expiry, sender match)
3. Shows preview of recipients and amounts
4. Allows user to approve and execute

## 🔐 Security Features

### Payment Links
- **EIP-712 Signing**: Prevents tampering
- **Nonce System**: Prevents replay attacks
- **Expiry Timestamps**: Links expire automatically
- **Sender Validation**: Only the signer can execute

### Subscriptions
- **Pre-approved Allowances**: User must approve token spending
- **Pause/Resume**: User control over active subscriptions
- **Payment Limits**: Can set total number of payments
- **Owner Controls**: Contract owner can manage subscriptions

## 📝 Deployment

### Deploy Contracts

```bash
cd contracts
npm run deploy-all
```

This will deploy:
1. XToken (if not already deployed)
2. AirdropHelper (if not already deployed)
3. **RewardLinkExecutor** (NEW)
4. **SubscriptionScheduler** (NEW)
5. ENSSubdomainRegistrar (if ENS available)

### Update Frontend Config

After deployment, update `src/config/wagmi.ts`:

```typescript
export const REWARD_LINK_EXECUTOR_ADDRESS = '0x...' // From deployment
export const SUBSCRIPTION_SCHEDULER_ADDRESS = '0x...' // From deployment
```

## 🎨 UI Features

### Payment Link Handler
- ✅ Responsive design (mobile-first)
- ✅ Recipient list with amounts
- ✅ Balance validation
- ✅ Expiry warnings
- ✅ Transaction status tracking

### Subscription Manager
- ✅ Create subscription form
- ✅ Subscription cards with status
- ✅ Payment due indicators
- ✅ Pause/Resume/Cancel actions
- ✅ Progress tracking (X/Y payments)

## 🔄 Integration Points

### Wallet Page
- Subscription Manager added to `/wallet` route
- Accessible after wallet connection

### Vendor Dashboard
- Can generate payment links for batch distributions
- Integration with existing event management

## 📚 API Reference

### usePaymentLink Hook

```typescript
const {
  executePaymentLink,  // Execute a payment link
  hash,                // Transaction hash
  isPending,           // Transaction pending
  isConfirming,        // Waiting for confirmation
  isSuccess,           // Transaction succeeded
  error,               // Error object
} = usePaymentLink()
```

### useSubscriptions Hook

```typescript
const {
  createSubscription,      // Create new subscription
  executePayment,          // Execute due payment
  executeBatchPayments,    // Execute multiple payments
  cancelSubscription,      // Cancel subscription
  pauseSubscription,       // Pause subscription
  resumeSubscription,      // Resume subscription
  subscriptionIds,         // User's subscription IDs
  refetchSubscriptionIds,  // Refresh subscription list
  hash,                    // Transaction hash
  isPending,               // Transaction pending
  isConfirming,            // Waiting for confirmation
  isSuccess,               // Transaction succeeded
  error,                  // Error object
} = useSubscriptions()
```

## 🐛 Known Limitations

1. **Subscription Fetching**: Currently simplified - in production, use a multicall hook to fetch all subscription details efficiently
2. **Payment Link Generation**: Backend implementation needed for actual link generation
3. **ENS Resolution**: Payment links don't resolve ENS names yet (can be added)

## 🚧 Future Enhancements

- [ ] Multicall for batch subscription fetching
- [ ] Backend API for payment link generation
- [ ] ENS name resolution in payment links
- [ ] Email notifications for payment links
- [ ] Subscription payment reminders
- [ ] Batch payment execution UI
- [ ] Payment link QR code generation
- [ ] Analytics dashboard for subscriptions

## 📖 Related Documentation

- [EIP-712: Typed Structured Data Hashing and Signing](https://eips.ethereum.org/EIPS/eip-712)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Wagmi Documentation](https://wagmi.sh/)

