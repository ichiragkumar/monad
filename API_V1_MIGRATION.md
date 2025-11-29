# API v1 Migration Guide

## Overview

The frontend has been updated to work with the new backend API v1. All endpoints now use `/api/v1/` prefix and follow the standardized response format.

## Changes Made

### 1. API Configuration (`src/config/api.ts`)

- ✅ Updated all endpoints to use `/api/v1/` prefix
- ✅ Removed old endpoints (auth, balance, token, etc.)
- ✅ Added new v1 endpoints (users, transactions, events, etc.)
- ✅ Organized endpoints by resource type

### 2. API Service (`src/services/api.ts`)

- ✅ Updated to use new endpoint structure
- ✅ Updated response handling to use `{success, data, pagination}` format
- ✅ Removed JWT token management (now uses EIP-712 signature)
- ✅ Added all new v1 endpoints:
  - Users (create/get with signature)
  - Transactions (CRUD operations)
  - Batch Transactions
  - Rewards
  - Events (with participants)
  - Subscriptions
  - Payment Links
  - Sync Status

### 3. Authentication (`src/contexts/AuthContext.tsx`)

- ✅ Changed from JWT to EIP-712 signature authentication
- ✅ Uses `useSignMessage` from Wagmi to sign messages
- ✅ Creates/get user with signature on wallet connect
- ✅ Removed token storage (no longer needed)

### 4. Transaction Hooks (`src/hooks/useBackendTransactions.ts`)

- ✅ Updated to use new transaction endpoints
- ✅ Updated response handling for new format
- ✅ Updated `logTransaction` to use `createTransaction` endpoint
- ✅ Updated pagination handling

### 5. Vendor Hooks

#### `useVendorEvents.ts`
- ✅ Updated to use new events endpoints
- ✅ Updated response handling
- ✅ Removed dashboard endpoint (calculate from events)

#### `useWhitelist.ts`
- ✅ Updated to use `events/:eventId/participants` endpoint
- ✅ Updated CSV upload to parse and use new endpoint
- ✅ Removed old whitelist-specific endpoints

#### `useBackendAirdrop.ts`
- ✅ Updated to use `rewards` endpoint
- ✅ Updated to include vendor address and tx hash

### 6. Components

#### `SyncStatusIndicator.tsx`
- ✅ Updated response handling for new format

### 7. Pages

#### `Wallet.tsx`
- ✅ Updated transaction formatting for new response structure
- ✅ Handles both old and new field names for compatibility

#### `Analytics.tsx`
- ⚠️ Analytics endpoints not yet in v1 API
- ✅ Calculates stats from transactions and events
- ⚠️ Limited functionality until analytics endpoints are added

## Response Format Changes

### Old Format:
```json
{
  "transactions": [...],
  "count": 100
}
```

### New Format:
```json
{
  "success": true,
  "data": {
    "transactions": [...]
  },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Authentication Changes

### Old (JWT):
```typescript
// Token stored in localStorage
const token = localStorage.getItem('api_token')
headers['Authorization'] = `Bearer ${token}`
```

### New (EIP-712):
```typescript
// Sign message on each request
const message = `Sign in to PayMint\n\nTimestamp: ${timestamp}`
const signature = await signMessageAsync({ message })
// Send signature with request
```

## Endpoint Mapping

| Old Endpoint | New Endpoint |
|-------------|--------------|
| `POST /api/auth/register` | `POST /api/v1/users` |
| `GET /api/auth/me` | `GET /api/v1/users/:walletAddress` |
| `GET /api/transactions` | `GET /api/v1/transactions` |
| `POST /api/transfer` | `POST /api/v1/transactions` |
| `POST /api/vendor/event` | `POST /api/v1/events` |
| `GET /api/vendor/events` | `GET /api/v1/events?vendorAddress=...` |
| `POST /api/vendor/:id/whitelist` | `POST /api/v1/events/:eventId/participants` |
| `POST /api/airdrop` | `POST /api/v1/rewards` |
| `GET /api/sync/status` | `GET /api/v1/sync/status` |

## Breaking Changes

1. **Authentication**: No longer uses JWT tokens, requires EIP-712 signature
2. **Response Format**: All responses wrapped in `{success, data}` format
3. **Pagination**: Now uses `pagination` object instead of `count`
4. **Amounts**: Stored as decimal strings (not BigInt)
5. **Transaction Fields**: Some field names changed (`fromAddress` → `from`, etc.)

## Testing

1. **Clear localStorage**:
   ```javascript
   localStorage.clear()
   ```

2. **Connect wallet** - Should sign message and register user

3. **Test transactions** - Should log to backend and appear in history

4. **Test events** - Should create and list events correctly

5. **Test sync status** - Should show syncing indicator

## Known Issues / TODO

1. ⚠️ **Analytics endpoints** - Not yet in v1 API, using calculated stats
2. ⚠️ **Remove participant** - Endpoint not yet in v1 API
3. ⚠️ **Vendor role detection** - Need to add when backend supports it
4. ⚠️ **Error handling** - May need updates for new error format

## Migration Checklist

- [x] Update API configuration
- [x] Update API service layer
- [x] Update authentication to EIP-712
- [x] Update transaction hooks
- [x] Update vendor hooks
- [x] Update components
- [x] Update pages
- [x] Test authentication flow
- [x] Test transaction flow
- [x] Test event creation
- [ ] Test all features end-to-end
- [ ] Update error handling
- [ ] Add analytics endpoints when available

## Notes

- Frontend is backward compatible with old field names where possible
- Some features may have limited functionality until backend endpoints are complete
- All API calls now use standardized response format
- Authentication is more secure with EIP-712 signatures

