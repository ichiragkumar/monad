# API Requirements for Profile Features

This document outlines all the API endpoints required for the profile dropdown features and related pages.

## 📋 Overview

The profile section requires the following features:
1. **Request Vendor Role** - Allow users to request vendor status
2. **My Subscriptions** - View user's active subscriptions
3. **My Event Participants** - View events where user is a participant
4. **Next Payments** - View upcoming subscription payments
5. **Payment Initiated** - View payment links created by user

---

## 🔐 1. Request Vendor Role

### Endpoint
**POST** `/api/v1/users/:walletAddress/vendor-request`

### Description
Allows a user to request vendor role. The backend should store this request and allow admins to approve/reject it.

### Request Headers
```
Content-Type: application/json
```

### Request Body
```json
{
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "businessName": "My Coffee Shop",
  "description": "A local coffee shop",
  "website": "https://coffeeshop.example.com",
  "signature": "0x...", // EIP-712 signature
  "message": "Request vendor role for MonadPay",
  "timestamp": 1732872600
}
```

### Response (Success - 200)
```json
{
  "success": true,
  "data": {
    "requestId": "req_abc123",
    "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "status": "PENDING",
    "businessName": "My Coffee Shop",
    "submittedAt": "2025-11-29T10:00:00.000Z",
    "message": "Vendor request submitted successfully"
  }
}
```

### Response (Error - 400)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid wallet address",
    "details": {
      "field": "walletAddress",
      "reason": "Invalid Ethereum address format"
    }
  }
}
```

### Response (Error - 409)
```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_REQUEST",
    "message": "Vendor request already exists for this address",
    "details": {
      "requestId": "req_abc123",
      "status": "PENDING"
    }
  }
}
```

### Database Schema
```prisma
model VendorRequest {
  id            String   @id @default(cuid())
  requestId     String   @unique
  walletAddress String   @db.VarChar(42)
  businessName  String?
  description   String?
  website       String?
  status        String   @default("PENDING") // PENDING, APPROVED, REJECTED
  submittedAt   DateTime @default(now())
  reviewedAt    DateTime?
  reviewedBy    String?
  rejectionReason String?
  
  @@index([walletAddress])
  @@index([status])
}
```

---

## 📅 2. My Subscriptions

### Endpoint
**GET** `/api/v1/subscriptions?walletAddress=0x...&status=active&page=1&limit=20`

### Description
Get all subscriptions for a user (as subscriber). Returns paginated list of active and inactive subscriptions.

### Query Parameters
- `walletAddress` (required): User's wallet address
- `status` (optional): Filter by status (`active`, `paused`, `cancelled`)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)

### Response (Success - 200)
```json
{
  "success": true,
  "data": [
    {
      "id": "sub_abc123",
      "onChainId": "1",
      "subscriberAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      "recipient": "0xFd6F109a1c1AdC68567F0c1066531738b5beD11",
      "planName": "Premium Newsletter",
      "amountPerPeriod": "5000000000000000000",
      "interval": 2592000,
      "periodDays": 30,
      "status": "active",
      "nextPaymentTime": 1732959000,
      "nextBillingDate": "2025-12-29T10:00:00.000Z",
      "totalPayments": 12,
      "paidCount": 3,
      "totalPaid": "15000000000000000000",
      "createdAt": "2025-11-29T10:00:00.000Z",
      "lastPaymentAt": "2025-11-29T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

### Notes
- `onChainId` is the subscription ID from the smart contract
- `interval` is in seconds (2592000 = 30 days)
- `nextPaymentTime` is Unix timestamp
- `totalPayments` can be null for unlimited subscriptions
- `paidCount` tracks how many payments have been made

---

## 🎯 3. My Event Participants

### Endpoint
**GET** `/api/v1/events/participant/:walletAddress?page=1&limit=20&status=active`

### Description
Get all events where the user is a participant. Returns events with participant details including reward amount and claim status.

### Path Parameters
- `walletAddress` (required): User's wallet address

### Query Parameters
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `status` (optional): Filter by event status (`draft`, `active`, `completed`)

### Response (Success - 200)
```json
{
  "success": true,
  "data": [
    {
      "eventId": "evt_abc123",
      "event": {
        "id": "evt_abc123",
        "name": "Hackathon November 2025",
        "description": "Monthly hackathon event",
        "status": "active",
        "startDate": "2025-12-01T00:00:00.000Z",
        "endDate": "2025-12-03T23:59:59.000Z",
        "organizer": {
          "address": "0xFd6F109a1c1AdC68567F0c1066531738b5beD11",
          "ensName": "vendor.ourapp.eth"
        }
      },
      "participant": {
        "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
        "amount": "10000000000000000000",
        "claimed": false,
        "addedAt": "2025-11-29T10:00:00.000Z"
      },
      "participantCount": 50,
      "totalDistributed": "500000000000000000000"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 3,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

### Database Query Logic
```sql
SELECT 
  e.*,
  ep.amount,
  ep.claimed,
  ep.createdAt as addedAt
FROM Event e
INNER JOIN EventParticipant ep ON e.id = ep.eventId
WHERE ep.address = :walletAddress
  AND (:status IS NULL OR e.status = :status)
ORDER BY e.createdAt DESC
LIMIT :limit OFFSET :offset
```

---

## 💳 4. Next Payments

### Endpoint
**GET** `/api/v1/subscriptions/next-payments?walletAddress=0x...&days=30&limit=20`

### Description
Get upcoming subscription payments for a user. Returns payments sorted by due date (earliest first).

### Query Parameters
- `walletAddress` (required): User's wallet address
- `days` (optional): Look ahead days (default: 30, max: 365)
- `limit` (optional): Max results (default: 20, max: 100)

### Response (Success - 200)
```json
{
  "success": true,
  "data": [
    {
      "subscriptionId": "sub_abc123",
      "onChainId": "1",
      "subscriberAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      "recipient": "0xFd6F109a1c1AdC68567F0c1066531738b5beD11",
      "planName": "Premium Newsletter",
      "amount": "5000000000000000000",
      "nextPaymentTime": 1732959000,
      "nextBillingDate": "2025-12-29T10:00:00.000Z",
      "interval": 2592000,
      "periodDays": 30,
      "isDue": false,
      "daysUntilDue": 5,
      "totalPayments": 12,
      "paidCount": 3,
      "progress": "3/12"
    }
  ],
  "meta": {
    "totalUpcoming": 5,
    "totalDue": 0,
    "totalAmountDue": "0",
    "lookAheadDays": 30
  }
}
```

### Calculation Logic
```javascript
// Filter subscriptions where status = 'active'
// Calculate nextPaymentTime from lastPaymentAt + interval
// Sort by nextPaymentTime ASC
// Filter where nextPaymentTime <= (now + days)
// Calculate isDue = nextPaymentTime <= now
// Calculate daysUntilDue = Math.ceil((nextPaymentTime - now) / 86400)
```

---

## 🔗 5. Payment Initiated

### Endpoint
**GET** `/api/v1/payment-links/initiated/:walletAddress?page=1&limit=20&status=all`

### Description
Get all payment links created by a user (as creator). Returns payment links with execution status.

### Path Parameters
- `walletAddress` (required): Creator's wallet address

### Query Parameters
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `status` (optional): Filter by status (`all`, `pending`, `executed`, `expired`)

### Response (Success - 200)
```json
{
  "success": true,
  "data": [
    {
      "id": "link_abc123",
      "linkId": "abc123def456",
      "creatorAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      "recipients": [
        {
          "address": "0xFd6F109a1c1AdC68567F0c1066531738b5beD11",
          "amount": "1000000000000000000"
        },
        {
          "address": "0x1234567890123456789012345678901234567890",
          "amount": "2000000000000000000"
        }
      ],
      "totalAmount": "3000000000000000000",
      "status": "executed",
      "executedAt": "2025-11-29T10:05:00.000Z",
      "txHash": "0xabcdef1234567890...",
      "expiresAt": "2025-12-31T23:59:59.000Z",
      "createdAt": "2025-11-29T10:00:00.000Z",
      "executionCount": 1
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 10,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

### Database Query Logic
```sql
SELECT 
  pl.*,
  COUNT(ple.id) as executionCount,
  MAX(ple.executedAt) as executedAt,
  MAX(ple.txHash) as txHash
FROM PaymentLink pl
LEFT JOIN PaymentLinkExecution ple ON pl.id = ple.paymentLinkId
WHERE pl.creatorAddress = :walletAddress
  AND (:status = 'all' OR pl.status = :status)
GROUP BY pl.id
ORDER BY pl.createdAt DESC
LIMIT :limit OFFSET :offset
```

### Status Values
- `pending`: Link created but not executed
- `executed`: Link has been executed (at least once)
- `expired`: Link has passed expiration date

---

## 🔄 6. Update User Role (After Vendor Approval)

### Endpoint
**PATCH** `/api/v1/users/:walletAddress/role`

### Description
Update user role (typically called by admin after approving vendor request).

### Request Body
```json
{
  "role": "VENDOR",
  "vendorData": {
    "businessName": "My Coffee Shop",
    "description": "A local coffee shop",
    "website": "https://coffeeshop.example.com"
  }
}
```

### Response (Success - 200)
```json
{
  "success": true,
  "data": {
    "userId": "usr_abc123",
    "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "role": "VENDOR",
    "vendorProfile": {
      "businessName": "My Coffee Shop",
      "description": "A local coffee shop",
      "website": "https://coffeeshop.example.com"
    },
    "updatedAt": "2025-11-29T10:00:00.000Z"
  }
}
```

---

## 📊 7. Get User Profile with Role

### Endpoint
**GET** `/api/v1/users/:walletAddress`

### Description
Get user profile including role and vendor status. This endpoint should already exist but needs to return role information.

### Response (Success - 200)
```json
{
  "success": true,
  "data": {
    "userId": "usr_abc123",
    "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "ensName": "alice.ourapp.eth",
    "role": "USER", // or "VENDOR"
    "profile": {
      "displayName": "Alice",
      "avatar": "https://..."
    },
    "vendorProfile": {
      "businessName": "My Coffee Shop",
      "description": "A local coffee shop",
      "website": "https://coffeeshop.example.com"
    },
    "createdAt": "2025-11-29T10:00:00.000Z",
    "lastSeenAt": "2025-11-29T10:00:00.000Z",
    "stats": {
      "totalTransactions": 50,
      "totalSubscriptions": 3,
      "totalEventsParticipated": 5
    }
  }
}
```

---

## 🧪 Testing Examples

### 1. Request Vendor Role
```bash
curl -X POST http://localhost:3000/api/v1/users/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb/vendor-request \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "businessName": "My Coffee Shop",
    "description": "A local coffee shop",
    "website": "https://coffeeshop.example.com",
    "signature": "0x...",
    "message": "Request vendor role",
    "timestamp": 1732872600
  }'
```

### 2. Get My Subscriptions
```bash
curl -X GET "http://localhost:3000/api/v1/subscriptions?walletAddress=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb&status=active" \
  -H "Content-Type: application/json"
```

### 3. Get My Event Participants
```bash
curl -X GET "http://localhost:3000/api/v1/events/participant/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb?status=active" \
  -H "Content-Type: application/json"
```

### 4. Get Next Payments
```bash
curl -X GET "http://localhost:3000/api/v1/subscriptions/next-payments?walletAddress=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb&days=30" \
  -H "Content-Type: application/json"
```

### 5. Get Payment Initiated
```bash
curl -X GET "http://localhost:3000/api/v1/payment-links/initiated/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb?status=all" \
  -H "Content-Type: application/json"
```

---

## 📝 Implementation Notes

1. **Authentication**: All endpoints should verify EIP-712 signature or use existing auth mechanism
2. **Pagination**: All list endpoints should support pagination
3. **Error Handling**: Use consistent error response format
4. **Caching**: Consider caching for frequently accessed data
5. **Rate Limiting**: Implement rate limiting for public endpoints
6. **Validation**: Validate all input parameters (wallet addresses, amounts, etc.)

---

## 🔄 Database Migrations Required

1. **VendorRequest Table**: New table for vendor requests
2. **User Table**: Add `role` field (ENUM: USER, VENDOR)
3. **User Table**: Add `vendorProfile` JSON field
4. **PaymentLink Table**: Add `creatorAddress` index
5. **EventParticipant Table**: Ensure proper indexes for participant queries

---

## ✅ Checklist

- [ ] Implement `POST /api/v1/users/:walletAddress/vendor-request`
- [ ] Update `GET /api/v1/subscriptions` to filter by subscriber
- [ ] Implement `GET /api/v1/events/participant/:walletAddress`
- [ ] Implement `GET /api/v1/subscriptions/next-payments`
- [ ] Implement `GET /api/v1/payment-links/initiated/:walletAddress`
- [ ] Update `GET /api/v1/users/:walletAddress` to include role
- [ ] Add database migrations
- [ ] Add proper indexes
- [ ] Add validation and error handling
- [ ] Write tests for all endpoints

