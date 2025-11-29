# Frontend Testing & Verification Guide
## Monad Micropayments Platform

Complete guide for testing the frontend integration with the backend API.

---

## 📋 Prerequisites

1. **Backend server running** on `http://localhost:3000`
   ```bash
   cd backend
   npm run dev
   ```

2. **Frontend development server** running
   ```bash
   cd fe
   npm run dev
   ```

3. **MetaMask or compatible wallet** installed and connected to Monad Testnet

4. **Environment variables** configured:
   - Create `.env` file in `fe/` directory:
   ```env
   VITE_API_BASE_URL=http://localhost:3000/api
   ```

---

## 🚀 Initial Setup

### 1. Start Backend Server

```bash
cd backend
npm run dev
```

**Expected Output:**
```
🚀 Server running on 0.0.0.0:3000
📊 Environment: development
🔗 API: http://0.0.0.0:3000/api
❤️  Health: http://0.0.0.0:3000/health
```

### 2. Start Frontend Server

```bash
cd fe
npm run dev
```

**Expected Output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 3. Verify Backend Health

Open browser: `http://localhost:3000/health`

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-29T10:00:00.000Z",
  "environment": "development"
}
```

---

## 🔐 Authentication Flow Testing

### Test 1: Wallet Connection & Auto-Registration

**Steps:**
1. Open frontend: `http://localhost:5173`
2. Click "Connect Wallet" button
3. Select MetaMask (or your wallet)
4. Approve connection

**Expected Behavior:**
- ✅ Wallet connects successfully
- ✅ User is automatically registered in backend
- ✅ API token is stored in localStorage
- ✅ Navigation shows: Wallet, Vendor Dashboard, Analytics
- ✅ User profile is loaded

**Verify in Browser Console:**
```javascript
// Check token stored
localStorage.getItem('api_token')

// Check user data
// Should see API calls to /api/auth/register and /api/auth/me
```

**Verify in Backend Logs:**
```
POST /api/auth/register - 201 Created
GET /api/auth/me - 200 OK
```

---

## 💰 Wallet Page Testing

### Test 2: View Balance

**Steps:**
1. Navigate to `/wallet` page
2. Wait for balance to load

**Expected Behavior:**
- ✅ Shows X Token balance
- ✅ Shows native token (MON) balance for gas
- ✅ Shows wallet address (formatted)
- ✅ Copy address button works

**What to Check:**
- Balance is fetched from blockchain (via Wagmi)
- Balance displays correctly formatted
- Address is clickable to copy

---

### Test 3: Send Tokens

**Steps:**
1. On `/wallet` page
2. Enter recipient address: `0xFd6F109a1c1AdC68567F0c1066531738b5beD11`
3. Enter amount: `10.0`
4. Click "Send Tokens"
5. Approve transaction in MetaMask

**Expected Behavior:**
- ✅ Transaction is sent to blockchain
- ✅ Transaction hash is displayed
- ✅ "View on Explorer" link appears
- ✅ Transaction is logged to backend
- ✅ Transaction appears in "Recent Transactions" list
- ✅ Balance updates after confirmation

**Verify in Backend Logs:**
```
POST /api/transactions - 201 Created
{
  "txHash": "0x...",
  "from": "0x...",
  "to": "0x...",
  "amount": "10000000000000000000",
  "type": "send"
}
```

**Verify in Frontend:**
- Transaction appears in history
- Status shows "pending" initially
- Status updates to "confirmed" after sync

---

### Test 4: Transaction History with Pagination

**Steps:**
1. On `/wallet` page
2. Scroll to "Recent Transactions" section
3. Make multiple transactions (if needed)
4. Test pagination buttons

**Expected Behavior:**
- ✅ Transactions load from backend (not blockchain)
- ✅ Shows pagination controls if > 20 transactions
- ✅ "Previous" and "Next" buttons work
- ✅ Page number and total count displayed
- ✅ Transactions sorted by newest first

**Verify:**
- Check Network tab: `GET /api/transactions?limit=20&offset=0`
- Transactions show correct status (pending/confirmed/failed)
- Sync status indicator shows if syncing

---

### Test 5: Sync Status Indicator

**Steps:**
1. Send a new transaction
2. Watch the sync status indicator

**Expected Behavior:**
- ✅ Shows "Transactions syncing in progress..." for recent transactions
- ✅ Shows pending count if any
- ✅ Updates to "All transactions synced" when done
- ✅ Indicator disappears when no pending transactions

**Verify:**
- Check Network tab: `GET /api/sync/status?walletAddress=0x...`
- Status updates every 30 seconds

---

## 🏪 Vendor Dashboard Testing

### Test 6: Create Event

**Steps:**
1. Navigate to `/vendor` page
2. Click "Create Event" button
3. Fill in form:
   - Name: "Test Event 2025"
   - Description: "Testing event creation"
   - Start Date: (optional)
   - End Date: (optional)
   - Token Budget: "1000000000000000000000" (1000 tokens in wei)
4. Click "Create"

**Expected Behavior:**
- ✅ Event is created in backend
- ✅ Event appears in "Your Events & Programs" list
- ✅ Stats update (Total Events +1)
- ✅ Event status shows as "DRAFT"

**Verify in Backend Logs:**
```
POST /api/vendor/event - 201 Created
{
  "id": "clx...",
  "name": "Test Event 2025",
  "status": "DRAFT"
}
```

**Verify in Frontend:**
- Event card appears in list
- Event details are correct
- Can expand/collapse event card

---

### Test 7: Add Participants to Whitelist

**Steps:**
1. On `/vendor` page
2. Find your event
3. Click "Manage Participants"
4. Add addresses:
   - `0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb`
   - `0x1234567890123456789012345678901234567890`
5. Click "Add Participants"

**Expected Behavior:**
- ✅ Participants added to backend whitelist
- ✅ Event participant count updates
- ✅ Participants appear in list

**Verify in Backend Logs:**
```
POST /api/vendor/{eventId}/whitelist - 200 OK
{
  "message": "Whitelist entries added",
  "added": 2
}
```

---

### Test 8: Upload CSV Whitelist

**Steps:**
1. Create CSV file `whitelist.csv`:
   ```csv
   address,amount
   0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb,10000000000000000000
   0x1234567890123456789012345678901234567890,5000000000000000000
   ```
2. In Participant Manager, click "Upload CSV"
3. Select `whitelist.csv`
4. Click "Upload"

**Expected Behavior:**
- ✅ CSV is parsed correctly
- ✅ Participants are added to whitelist
- ✅ Amounts are assigned correctly

**Verify in Backend Logs:**
```
POST /api/vendor/{eventId}/whitelist/upload - 200 OK
{
  "message": "Whitelist uploaded",
  "added": 2
}
```

---

### Test 9: Distribute Rewards (Airdrop)

**Steps:**
1. On `/vendor` page
2. Find event with participants
3. Click "Distribute Rewards"
4. Select "Equal Amount" or "Variable Amounts"
5. Enter amounts
6. Click "Approve Tokens" (if needed)
7. Click "Distribute Tokens"
8. Approve transaction in MetaMask

**Expected Behavior:**
- ✅ Approval transaction sent (if needed)
- ✅ Airdrop transaction sent to blockchain
- ✅ Transaction logged to backend
- ✅ Event stats update
- ✅ Success message shown

**Verify in Backend Logs:**
```
POST /api/airdrop/equal - 200 OK
{
  "txHash": "0x...",
  "recipientCount": 2,
  "status": "PENDING"
}
```

**Note:** The airdrop still uses the smart contract directly. The backend logs the transaction after execution.

---

## 📊 Analytics Page Testing

### Test 10: View Platform Statistics

**Steps:**
1. Navigate to `/analytics` page
2. Wait for stats to load

**Expected Behavior:**
- ✅ Platform stats displayed:
  - Total Users
  - Total Transactions
  - Total Events
  - Total Airdrops
- ✅ Transaction types breakdown shown
- ✅ Daily transaction chart displayed
- ✅ Period selector works (7/30/90/365 days)

**Verify in Backend Logs:**
```
GET /api/stats?days=30 - 200 OK
```

**Verify in Frontend:**
- Stats cards are visible
- Chart displays correctly
- Can change period

---

### Test 11: View Vendor Statistics

**Steps:**
1. Connect as vendor wallet
2. Navigate to `/analytics` page
3. Scroll to "Your Vendor Statistics"

**Expected Behavior:**
- ✅ Vendor-specific stats shown:
  - Your Events count
  - Airdrops Executed
  - Total Recipients
- ✅ Stats match your actual data

**Verify in Backend Logs:**
```
GET /api/stats/vendor/{address} - 200 OK
```

---

## 🔗 Payment Links Testing

### Test 12: Generate Payment Link

**Steps:**
1. As vendor, generate a payment link (via API or component)
2. Copy the link URL

**Expected Behavior:**
- ✅ Link is generated with EIP-712 signature
- ✅ Link contains encoded transaction data
- ✅ Link can be shared

**Verify:**
- Link format: `/approve-payment?token=...&sender=...`
- Link can be opened in browser

---

### Test 13: Execute Payment Link

**Steps:**
1. Open payment link in browser
2. Review transaction details
3. Approve transaction in MetaMask

**Expected Behavior:**
- ✅ Payment link page loads
- ✅ Shows recipients and amounts
- ✅ Transaction executes on blockchain
- ✅ Transaction logged to backend

**Verify in Backend Logs:**
```
POST /api/link/{linkId}/execute - 200 OK
{
  "txHash": "0x...",
  "status": "executed"
}
```

---

## 💳 Subscription Testing

### Test 14: Create Subscription

**Steps:**
1. On `/wallet` page
2. Scroll to Subscription Manager
3. Create a subscription:
   - Vendor Address: `0xFd6F109a1c1AdC68567F0c1066531738b5beD11`
   - Plan Name: "Monthly Premium"
   - Amount: `5000000000000000000` (5 tokens)
   - Period: 30 days
4. Approve transaction

**Expected Behavior:**
- ✅ Subscription created on-chain
- ✅ Subscription logged to backend
- ✅ Appears in subscription list

**Verify in Backend Logs:**
```
POST /api/subscription - 201 Created
{
  "id": "clx...",
  "isActive": true
}
```

---

## 🌐 ENS Testing

### Test 15: Claim ENS Subdomain

**Steps:**
1. On `/wallet` page
2. Click "Get ENS Name"
3. Enter label: "alice"
4. Approve transaction

**Expected Behavior:**
- ✅ ENS subdomain claimed (if ENS available)
- ✅ Name stored in backend
- ✅ Name displayed in wallet

**Verify in Backend Logs:**
```
POST /api/ens/claim - 200 OK
{
  "ensName": "alice.ourapp.eth"
}
```

**Note:** ENS may not be available on Monad Testnet.

---

## 🔄 Real-time Sync Testing

### Test 16: Transaction Sync Status

**Steps:**
1. Send a new transaction
2. Immediately check sync status
3. Wait 30-60 seconds
4. Check sync status again

**Expected Behavior:**
- ✅ Initially shows "syncing" or "pending"
- ✅ Updates to "synced" after backend syncs
- ✅ Transaction status updates from "pending" to "confirmed"

**Verify:**
- Check Network tab for periodic calls to `/api/sync/status`
- Check backend logs for sync job execution

---

## 🐛 Common Issues & Solutions

### Issue 1: "Cannot connect to backend"

**Symptoms:**
- API calls fail
- Network errors in console

**Solutions:**
1. Verify backend is running: `curl http://localhost:3000/health`
2. Check `VITE_API_BASE_URL` in `.env`
3. Check CORS settings in backend
4. Check browser console for errors

---

### Issue 2: "Authentication failed"

**Symptoms:**
- 401 Unauthorized errors
- User not logged in

**Solutions:**
1. Clear localStorage: `localStorage.clear()`
2. Reconnect wallet
3. Check token in localStorage: `localStorage.getItem('api_token')`
4. Verify backend JWT secret is set

---

### Issue 3: "Transactions not syncing"

**Symptoms:**
- Transactions stuck in "pending"
- Sync status always shows "syncing"

**Solutions:**
1. Check backend sync job is running
2. Verify RPC connection in backend
3. Check backend logs for sync errors
4. Manually trigger sync (if backend supports it)

---

### Issue 4: "Balance not updating"

**Symptoms:**
- Balance shows old value
- Transaction completed but balance unchanged

**Solutions:**
1. Refresh page
2. Check blockchain explorer for transaction
3. Verify token contract address is correct
4. Check RPC connection

---

## ✅ Verification Checklist

After completing all tests, verify:

- [ ] User can connect wallet and auto-register
- [ ] Balance displays correctly
- [ ] Send tokens works and logs to backend
- [ ] Transaction history loads from backend with pagination
- [ ] Sync status indicator shows correctly
- [ ] Vendor can create events
- [ ] Participants can be added to whitelist
- [ ] CSV upload works
- [ ] Airdrop distribution works
- [ ] Analytics page loads platform stats
- [ ] Vendor stats display correctly
- [ ] Payment links can be generated and executed
- [ ] Subscriptions can be created
- [ ] ENS subdomain can be claimed (if available)
- [ ] Transactions sync from blockchain to backend
- [ ] All API calls include authentication token
- [ ] Error handling works for failed requests

---

## 📝 Expected API Calls

When using the frontend, you should see these API calls in the Network tab:

### On Wallet Connect:
- `POST /api/auth/register`
- `GET /api/auth/me`

### On Wallet Page Load:
- `GET /api/transactions?limit=20&offset=0`
- `GET /api/sync/status?walletAddress=0x...`

### On Send Tokens:
- `POST /api/transactions` (after transaction confirmed)

### On Vendor Dashboard:
- `GET /api/vendor/events`
- `GET /api/vendor/{address}/dashboard`

### On Create Event:
- `POST /api/vendor/event`

### On Add Whitelist:
- `POST /api/vendor/{eventId}/whitelist`

### On Analytics Page:
- `GET /api/stats?days=30`
- `GET /api/stats/vendor/{address}` (if vendor)

---

## 🎯 Performance Expectations

- **Page Load:** < 2 seconds
- **API Response:** < 500ms
- **Transaction Confirmation:** 1-5 seconds (blockchain dependent)
- **Sync Status Update:** Every 30 seconds
- **Transaction History Load:** < 1 second

---

## 📞 Support

If you encounter issues:

1. Check browser console for errors
2. Check backend logs
3. Verify all environment variables are set
4. Ensure backend database is running
5. Check network connectivity

---

**This guide covers all major frontend features and their integration with the backend API.**

