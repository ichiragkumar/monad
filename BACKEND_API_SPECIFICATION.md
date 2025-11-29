# Backend API Specification
## Monad Micropayments Platform

This document specifies all backend API endpoints required for the Monad Micropayments Platform.

---

## 📋 Table of Contents

1. [Authentication & User Management](#1-authentication--user-management)
2. [Transaction Management](#2-transaction-management)
3. [Batch Transactions](#3-batch-transactions)
4. [Rewards & Airdrops](#4-rewards--airdrops)
5. [Subscriptions](#5-subscriptions)
6. [Payment Links](#6-payment-links)
7. [Vendor & Event Management](#7-vendor--event-management)
8. [Real-time Sync Status](#8-real-time-sync-status)
9. [Data Models](#9-data-models)

---

## 1. Authentication & User Management

### 1.1 Create/Get User Account
**POST** `/api/v1/users`

**Description**: Create or retrieve user account when wallet connects

**Request Body**:
```json
{
  "walletAddress": "0x...",
  "signature": "0x...", // EIP-712 signature for authentication
  "message": "Sign in to MonadPay...",
  "timestamp": 1234567890
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "walletAddress": "0x...",
    "ensName": "user.ourapp.eth" | null,
    "createdAt": "2024-01-01T00:00:00Z",
    "lastSeenAt": "2024-01-01T00:00:00Z",
    "profile": {
      "displayName": "User Name" | null,
      "avatar": "url" | null
    }
  }
}
```

**Requirements**:
- Verify EIP-712 signature
- Create account if doesn't exist
- Update `lastSeenAt` if exists
- Store wallet address (lowercase)
- Return user profile data

---

### 1.2 Get User Profile
**GET** `/api/v1/users/:walletAddress`

**Response**:
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "walletAddress": "0x...",
    "ensName": "user.ourapp.eth" | null,
    "stats": {
      "totalSent": "1000.5",
      "totalReceived": "500.25",
      "transactionCount": 42,
      "subscriptionCount": 3
    }
  }
}
```

---

## 2. Transaction Management

### 2.1 Get Transaction History
**GET** `/api/v1/transactions`

**Query Parameters**:
- `walletAddress` (required): User's wallet address
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 20): Items per page
- `type` (optional): `sent` | `received` | `all`
- `status` (optional): `pending` | `confirmed` | `failed`
- `fromDate` (optional): ISO timestamp
- `toDate` (optional): ISO timestamp

**Response**:
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "txHash": "0x...",
        "from": "0x...",
        "to": "0x...",
        "amount": "100.5",
        "token": "XTK",
        "type": "sent" | "received",
        "status": "pending" | "confirmed" | "failed",
        "blockNumber": 12345,
        "blockTimestamp": 1234567890,
        "gasUsed": "21000",
        "gasPrice": "20000000000",
        "createdAt": "2024-01-01T00:00:00Z",
        "confirmedAt": "2024-01-01T00:01:00Z" | null,
        "syncStatus": "synced" | "syncing" | "pending"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

**Requirements**:
- Return transactions from database only (not blockchain)
- Pagination support
- Filter by type, status, date range
- Include sync status
- Sort by `blockTimestamp` DESC (newest first)

---

### 2.2 Create Transaction Record
**POST** `/api/v1/transactions`

**Description**: Create transaction record when user sends tokens

**Request Body**:
```json
{
  "txHash": "0x...",
  "from": "0x...",
  "to": "0x...",
  "amount": "100.5",
  "token": "XTK",
  "type": "send" | "batch" | "reward" | "subscription" | "payment_link",
  "metadata": {
    "eventId": "uuid" | null,
    "subscriptionId": "uuid" | null,
    "paymentLinkId": "uuid" | null,
    "batchId": "uuid" | null
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "transactionId": "uuid",
    "txHash": "0x...",
    "status": "pending",
    "syncStatus": "pending",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

**Requirements**:
- Create transaction record immediately
- Set status to `pending`
- Set syncStatus to `pending`
- Store all metadata
- Return transaction ID

---

### 2.3 Update Transaction Status
**PATCH** `/api/v1/transactions/:txHash`

**Description**: Update transaction status after blockchain confirmation

**Request Body**:
```json
{
  "status": "confirmed" | "failed",
  "blockNumber": 12345,
  "blockTimestamp": 1234567890,
  "gasUsed": "21000",
  "gasPrice": "20000000000",
  "syncStatus": "synced"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "txHash": "0x...",
    "status": "confirmed",
    "syncStatus": "synced",
    "updatedAt": "2024-01-01T00:01:00Z"
  }
}
```

**Requirements**:
- Update transaction status
- Update sync status
- Store block data
- Update `confirmedAt` timestamp

---

### 2.4 Get Transaction by Hash
**GET** `/api/v1/transactions/:txHash`

**Response**:
```json
{
  "success": true,
  "data": {
    "txHash": "0x...",
    "from": "0x...",
    "to": "0x...",
    "amount": "100.5",
    "token": "XTK",
    "type": "send",
    "status": "confirmed",
    "blockNumber": 12345,
    "blockTimestamp": 1234567890,
    "syncStatus": "synced",
    "metadata": {}
  }
}
```

---

## 3. Batch Transactions

### 3.1 Create Batch Transaction
**POST** `/api/v1/batch-transactions`

**Description**: Create batch transaction record

**Request Body**:
```json
{
  "txHash": "0x...",
  "sender": "0x...",
  "recipients": [
    {
      "address": "0x...",
      "amount": "10.5"
    },
    {
      "address": "0x...",
      "amount": "20.0"
    }
  ],
  "totalAmount": "30.5",
  "token": "XTK",
  "type": "equal" | "variable",
  "eventId": "uuid" | null,
  "note": "Event rewards distribution"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "batchId": "uuid",
    "txHash": "0x...",
    "recipientCount": 2,
    "totalAmount": "30.5",
    "status": "pending",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

**Requirements**:
- Create batch transaction record
- Create individual transaction records for each recipient
- Link to event if provided
- Store all recipient data

---

### 3.2 Get Batch Transaction
**GET** `/api/v1/batch-transactions/:batchId`

**Response**:
```json
{
  "success": true,
  "data": {
    "batchId": "uuid",
    "txHash": "0x...",
    "sender": "0x...",
    "recipients": [
      {
        "address": "0x...",
        "amount": "10.5",
        "status": "confirmed"
      }
    ],
    "totalAmount": "30.5",
    "status": "confirmed",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### 3.3 Get Batch Transactions by User
**GET** `/api/v1/batch-transactions`

**Query Parameters**:
- `walletAddress` (required)
- `page` (optional, default: 1)
- `limit` (optional, default: 20)

**Response**: Same pagination format as transactions

---

## 4. Rewards & Airdrops

### 4.1 Create Reward Distribution
**POST** `/api/v1/rewards`

**Description**: Create reward/airdrop distribution record

**Request Body**:
```json
{
  "eventId": "uuid",
  "vendorAddress": "0x...",
  "txHash": "0x...",
  "recipients": [
    {
      "address": "0x...",
      "amount": "50.0",
      "reason": "Event attendance"
    }
  ],
  "totalAmount": "500.0",
  "token": "XTK",
  "distributionType": "equal" | "variable",
  "metadata": {
    "eventName": "Conference 2024",
    "notes": "Rewards for attendees"
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "rewardId": "uuid",
    "eventId": "uuid",
    "txHash": "0x...",
    "recipientCount": 10,
    "totalAmount": "500.0",
    "status": "pending",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### 4.2 Get Rewards by Event
**GET** `/api/v1/rewards/event/:eventId`

**Response**:
```json
{
  "success": true,
  "data": {
    "rewards": [
      {
        "rewardId": "uuid",
        "txHash": "0x...",
        "totalAmount": "500.0",
        "recipientCount": 10,
        "status": "confirmed",
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

---

## 5. Subscriptions

### 5.1 Create Subscription
**POST** `/api/v1/subscriptions`

**Description**: Create subscription record when user creates subscription on-chain

**Request Body**:
```json
{
  "subscriptionId": "123", // On-chain subscription ID
  "payer": "0x...",
  "recipient": "0x...",
  "amount": "100.0",
  "token": "XTK",
  "interval": 2592000, // seconds (30 days)
  "totalPayments": 12, // 0 for unlimited
  "nextPaymentTime": 1234567890,
  "startTime": 1234567890,
  "txHash": "0x..." // Creation transaction hash
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "subscriptionId": "uuid",
    "onChainId": "123",
    "payer": "0x...",
    "recipient": "0x...",
    "amount": "100.0",
    "status": "active",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

**Requirements**:
- Store on-chain subscription ID
- Link to payer and recipient
- Track subscription status
- Store payment schedule

---

### 5.2 Get User Subscriptions
**GET** `/api/v1/subscriptions`

**Query Parameters**:
- `walletAddress` (required)
- `type` (optional): `active` | `paused` | `cancelled` | `all`
- `page` (optional, default: 1)
- `limit` (optional, default: 20)

**Response**:
```json
{
  "success": true,
  "data": {
    "subscriptions": [
      {
        "subscriptionId": "uuid",
        "onChainId": "123",
        "payer": "0x...",
        "recipient": "0x...",
        "amount": "100.0",
        "interval": 2592000,
        "nextPaymentTime": 1234567890,
        "totalPayments": 12,
        "paidCount": 3,
        "status": "active",
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "totalPages": 1
    }
  }
}
```

---

### 5.3 Update Subscription Status
**PATCH** `/api/v1/subscriptions/:subscriptionId`

**Description**: Update subscription when paused/resumed/cancelled on-chain

**Request Body**:
```json
{
  "status": "active" | "paused" | "cancelled",
  "txHash": "0x...",
  "nextPaymentTime": 1234567890 // Updated if resumed
}
```

---

### 5.4 Record Subscription Payment
**POST** `/api/v1/subscriptions/:subscriptionId/payments`

**Description**: Record when subscription payment executes

**Request Body**:
```json
{
  "txHash": "0x...",
  "amount": "100.0",
  "paymentNumber": 4,
  "nextPaymentTime": 1234567890
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "paymentId": "uuid",
    "txHash": "0x...",
    "amount": "100.0",
    "paymentNumber": 4,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

**Requirements**:
- Create transaction record
- Update subscription paidCount
- Update nextPaymentTime
- Link payment to subscription

---

## 6. Payment Links

### 6.1 Generate Payment Link
**POST** `/api/v1/payment-links`

**Description**: Generate EIP-712 signed payment link

**Request Body**:
```json
{
  "sender": "0x...",
  "recipients": [
    {
      "address": "0x...",
      "amount": "10.5"
    }
  ],
  "token": "XTK",
  "expiry": 1234567890, // Unix timestamp
  "note": "Event rewards" | null,
  "eventId": "uuid" | null
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "paymentLinkId": "uuid",
    "linkUrl": "https://app.domain.xyz/approve-payment?token=...&sender=...",
    "nonce": 1,
    "expiry": 1234567890,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

**Requirements**:
- Generate unique nonce for sender
- Create EIP-712 typed data
- Sign with backend key (or return for frontend signing)
- Generate URL with encoded parameters
- Store payment link record

---

### 6.2 Get Payment Link
**GET** `/api/v1/payment-links/:paymentLinkId`

**Response**:
```json
{
  "success": true,
  "data": {
    "paymentLinkId": "uuid",
    "sender": "0x...",
    "recipients": [
      {
        "address": "0x...",
        "amount": "10.5"
      }
    ],
    "totalAmount": "30.5",
    "expiry": 1234567890,
    "status": "pending" | "executed" | "expired",
    "txHash": "0x..." | null,
    "createdAt": "2024-01-01T00:00:00Z",
    "executedAt": "2024-01-01T00:01:00Z" | null
  }
}
```

---

### 6.3 Execute Payment Link
**POST** `/api/v1/payment-links/:paymentLinkId/execute`

**Description**: Record payment link execution

**Request Body**:
```json
{
  "txHash": "0x...",
  "executedBy": "0x..."
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "paymentLinkId": "uuid",
    "txHash": "0x...",
    "status": "executed",
    "executedAt": "2024-01-01T00:01:00Z"
  }
}
```

**Requirements**:
- Update payment link status
- Create transaction records
- Link to event if provided

---

## 7. Vendor & Event Management

### 7.1 Create Event
**POST** `/api/v1/events`

**Description**: Create event when vendor creates on frontend

**Request Body**:
```json
{
  "vendorAddress": "0x...",
  "name": "Conference 2024",
  "description": "Annual tech conference",
  "eventDate": "2024-06-01T00:00:00Z",
  "status": "draft" | "active" | "completed",
  "metadata": {
    "location": "San Francisco",
    "maxParticipants": 1000
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "eventId": "uuid",
    "vendorAddress": "0x...",
    "name": "Conference 2024",
    "status": "draft",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

**Requirements**:
- Create event record
- Link to vendor
- Store all metadata
- Return event ID

---

### 7.2 Get Vendor Events
**GET** `/api/v1/events`

**Query Parameters**:
- `vendorAddress` (required)
- `status` (optional): `draft` | `active` | `completed`
- `page` (optional, default: 1)
- `limit` (optional, default: 20)

**Response**:
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "eventId": "uuid",
        "name": "Conference 2024",
        "description": "Annual tech conference",
        "status": "active",
        "participantCount": 150,
        "totalDistributed": "5000.0",
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 10,
      "totalPages": 1
    }
  }
}
```

---

### 7.3 Update Event
**PATCH** `/api/v1/events/:eventId`

**Request Body**:
```json
{
  "name": "Updated Event Name",
  "description": "Updated description",
  "status": "active"
}
```

---

### 7.4 Delete Event
**DELETE** `/api/v1/events/:eventId`

**Response**:
```json
{
  "success": true,
  "message": "Event deleted successfully"
}
```

---

### 7.5 Add Event Participants
**POST** `/api/v1/events/:eventId/participants`

**Request Body**:
```json
{
  "participants": [
    {
      "address": "0x...",
      "ensName": "user.ourapp.eth" | null,
      "amount": "50.0" | null // Optional reward amount
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "addedCount": 10,
    "totalParticipants": 150
  }
}
```

---

### 7.6 Get Event Participants
**GET** `/api/v1/events/:eventId/participants`

**Query Parameters**:
- `page` (optional, default: 1)
- `limit` (optional, default: 50)

**Response**: Paginated list of participants

---

## 8. Real-time Sync Status

### 8.1 Get Sync Status
**GET** `/api/v1/sync/status`

**Query Parameters**:
- `walletAddress` (required)

**Response**:
```json
{
  "success": true,
  "data": {
    "isSyncing": true,
    "lastSyncTime": "2024-01-01T00:00:00Z",
    "pendingTransactions": 3,
    "syncWindow": {
      "startTime": "2024-01-01T00:00:00Z",
      "endTime": "2024-01-01T00:10:00Z"
    },
    "message": "Transactions syncing in progress..."
  }
}
```

**Requirements**:
- Check if transactions from last 2-10 minutes are still syncing
- Return sync status
- Show pending transaction count
- Return user-friendly message

---

### 8.2 Get Recent Transactions (Last 2-10 min)
**GET** `/api/v1/transactions/recent`

**Query Parameters**:
- `walletAddress` (required)
- `minutes` (optional, default: 10): Lookback window

**Response**:
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "txHash": "0x...",
        "status": "pending",
        "syncStatus": "syncing",
        "createdAt": "2024-01-01T00:05:00Z"
      }
    ],
    "isSyncing": true,
    "syncMessage": "Transactions syncing in progress..."
  }
}
```

**Requirements**:
- Return transactions from last N minutes
- Show sync status for each
- Indicate if any are still syncing

---

## 9. Data Models

### 9.1 User Model
```typescript
{
  userId: string (UUID)
  walletAddress: string (lowercase)
  ensName: string | null
  createdAt: Date
  lastSeenAt: Date
  profile: {
    displayName: string | null
    avatar: string | null
  }
}
```

### 9.2 Transaction Model
```typescript
{
  transactionId: string (UUID)
  txHash: string (unique index)
  from: string
  to: string
  amount: string (decimal)
  token: string
  type: "send" | "batch" | "reward" | "subscription" | "payment_link"
  status: "pending" | "confirmed" | "failed"
  syncStatus: "pending" | "syncing" | "synced"
  blockNumber: number | null
  blockTimestamp: number | null
  gasUsed: string | null
  gasPrice: string | null
  createdAt: Date
  confirmedAt: Date | null
  metadata: JSON
}
```

### 9.3 Batch Transaction Model
```typescript
{
  batchId: string (UUID)
  txHash: string
  sender: string
  recipients: Array<{
    address: string
    amount: string
  }>
  totalAmount: string
  token: string
  type: "equal" | "variable"
  eventId: string | null
  status: "pending" | "confirmed" | "failed"
  createdAt: Date
}
```

### 9.4 Subscription Model
```typescript
{
  subscriptionId: string (UUID)
  onChainId: string
  payer: string
  recipient: string
  amount: string
  token: string
  interval: number (seconds)
  totalPayments: number
  paidCount: number
  nextPaymentTime: number
  startTime: number
  status: "active" | "paused" | "cancelled"
  createdAt: Date
}
```

### 9.5 Payment Link Model
```typescript
{
  paymentLinkId: string (UUID)
  sender: string
  recipients: Array<{
    address: string
    amount: string
  }>
  token: string
  nonce: number
  expiry: number
  status: "pending" | "executed" | "expired"
  txHash: string | null
  eventId: string | null
  createdAt: Date
  executedAt: Date | null
}
```

### 9.6 Event Model
```typescript
{
  eventId: string (UUID)
  vendorAddress: string
  name: string
  description: string
  eventDate: Date | null
  status: "draft" | "active" | "completed"
  participantCount: number
  totalDistributed: string
  metadata: JSON
  createdAt: Date
  updatedAt: Date
}
```

---

## 10. Background Jobs & Sync

### 10.1 Transaction Sync Job
**Description**: Background job that syncs pending transactions with blockchain

**Frequency**: Every 30 seconds

**Process**:
1. Query transactions with `syncStatus = "pending"` or `syncStatus = "syncing"`
2. For each transaction:
   - Fetch from blockchain by `txHash`
   - If found:
     - Update status (confirmed/failed)
     - Update block data
     - Set `syncStatus = "synced"`
   - If not found after 10 minutes:
     - Keep as pending
     - Set `syncStatus = "syncing"`
3. Update `lastSyncTime` for user

**Requirements**:
- Handle rate limits
- Retry failed lookups
- Update sync status
- Log errors

---

### 10.2 Subscription Payment Check Job
**Description**: Check for due subscription payments

**Frequency**: Every 5 minutes

**Process**:
1. Query active subscriptions where `nextPaymentTime <= now`
2. Check if payment executed on-chain
3. If executed:
   - Create payment record
   - Update subscription
4. If not executed:
   - Mark as due (optional notification)

---

## 11. Error Responses

All endpoints should return consistent error format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {} // Optional additional details
  }
}
```

**Common Error Codes**:
- `INVALID_SIGNATURE`: Signature verification failed
- `WALLET_NOT_FOUND`: Wallet address not found
- `TRANSACTION_NOT_FOUND`: Transaction hash not found
- `INVALID_PARAMETERS`: Request validation failed
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_ERROR`: Server error

---

## 12. Rate Limiting

- **Authentication endpoints**: 10 requests/minute
- **Transaction endpoints**: 60 requests/minute
- **Read endpoints**: 100 requests/minute
- **Write endpoints**: 30 requests/minute

---

## 13. Webhooks (Optional)

### 13.1 Transaction Confirmed Webhook
**POST** `/webhooks/transaction-confirmed`

**Payload**:
```json
{
  "txHash": "0x...",
  "status": "confirmed",
  "blockNumber": 12345
}
```

---

## 14. Database Indexes Required

```sql
-- Users
CREATE INDEX idx_users_wallet_address ON users(wallet_address);
CREATE INDEX idx_users_ens_name ON users(ens_name);

-- Transactions
CREATE INDEX idx_transactions_tx_hash ON transactions(tx_hash);
CREATE INDEX idx_transactions_from ON transactions(from_address);
CREATE INDEX idx_transactions_to ON transactions(to_address);
CREATE INDEX idx_transactions_wallet ON transactions(from_address, to_address);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX idx_transactions_sync_status ON transactions(sync_status);
CREATE INDEX idx_transactions_status ON transactions(status);

-- Subscriptions
CREATE INDEX idx_subscriptions_payer ON subscriptions(payer);
CREATE INDEX idx_subscriptions_recipient ON subscriptions(recipient);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_next_payment ON subscriptions(next_payment_time);

-- Payment Links
CREATE INDEX idx_payment_links_sender ON payment_links(sender);
CREATE INDEX idx_payment_links_status ON payment_links(status);
CREATE INDEX idx_payment_links_expiry ON payment_links(expiry);

-- Events
CREATE INDEX idx_events_vendor ON events(vendor_address);
CREATE INDEX idx_events_status ON events(status);
```

---

## 15. API Versioning

All endpoints use `/api/v1/` prefix.

Future versions: `/api/v2/`, etc.

---

## Summary Checklist

✅ **User Management**
- [ ] Create/get user on wallet connect
- [ ] User profile management
- [ ] User stats

✅ **Transaction Management**
- [ ] Create transaction record
- [ ] Get transaction history (paginated)
- [ ] Update transaction status
- [ ] Sync with blockchain

✅ **Batch Transactions**
- [ ] Create batch record
- [ ] Get batch transactions
- [ ] Link to events

✅ **Rewards**
- [ ] Create reward distribution
- [ ] Get rewards by event
- [ ] Track reward recipients

✅ **Subscriptions**
- [ ] Create subscription record
- [ ] Get user subscriptions
- [ ] Update subscription status
- [ ] Record subscription payments

✅ **Payment Links**
- [ ] Generate payment link
- [ ] Get payment link details
- [ ] Record execution

✅ **Events**
- [ ] Create event
- [ ] Get vendor events
- [ ] Update/delete event
- [ ] Manage participants

✅ **Sync Status**
- [ ] Get sync status
- [ ] Show syncing message
- [ ] Recent transactions check

✅ **Background Jobs**
- [ ] Transaction sync job
- [ ] Subscription payment check

---

**This specification covers all backend requirements for the Monad Micropayments Platform.**

