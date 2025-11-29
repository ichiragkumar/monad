# ENS Setup Guide

## Current Status: ⏸️ Not Needed

**ENS is NOT available on Monad testnet yet**, so you **don't need to set these values** right now.

## What Are These Variables?

The ENS environment variables in your `.env` file are for deploying the `ENSSubdomainRegistrar` contract, which allows users to claim subdomains like `alice.ourapp.eth`.

### Variables Explained

```env
ENS_REGISTRY_ADDRESS=0x...     # Address of ENS Registry contract
ENS_RESOLVER_ADDRESS=0x...     # Address of ENS Resolver contract  
ENS_PARENT_NODE=0x...          # Bytes32 hash of parent domain (e.g., ourapp.eth)
```

## What to Do Now

### Option 1: Leave Them Commented Out (Recommended)

In your `.env` file, keep them commented out or empty:

```env
# ENS Configuration (not available on Monad testnet yet)
# ENS_REGISTRY_ADDRESS=
# ENS_RESOLVER_ADDRESS=
# ENS_PARENT_NODE=
```

### Option 2: Remove Them Entirely

You can simply not include them in your `.env` file. The deployment script will skip ENS deployment if they're missing.

## When ENS Becomes Available

If/when ENS infrastructure is deployed on Monad, you'll need to:

### Step 1: Get ENS Contract Addresses

You'll need to find:
1. **ENS Registry Address** - The main ENS registry contract on Monad
2. **ENS Resolver Address** - The resolver contract that maps names to addresses
3. **Parent Node** - The bytes32 hash of your parent domain (e.g., `ourapp.eth`)

### Step 2: Register Your Parent Domain

Before deploying the subdomain registrar, you need to:
1. Register your parent domain (e.g., `ourapp.eth`) on Monad's ENS
2. Get the bytes32 node hash of that domain
3. Set up a resolver for it

### Step 3: Update .env File

```env
ENS_REGISTRY_ADDRESS=0x1234567890abcdef...  # Actual ENS Registry on Monad
ENS_RESOLVER_ADDRESS=0xabcdef1234567890...  # Actual ENS Resolver on Monad
ENS_PARENT_NODE=0x0000000000000000000000000000000000000000000000000000000000000000  # Your domain's node hash
```

### Step 4: Deploy ENS Contract

Run the deployment again:
```bash
npm run deploy-all
```

The script will automatically deploy ENSSubdomainRegistrar if all three variables are set.

## How to Get Parent Node Hash

The parent node is a bytes32 hash. You can calculate it using:

```javascript
// In Hardhat console or Node.js
const ethers = require("ethers");
const namehash = require("eth-ens-namehash");

// For "ourapp.eth"
const node = namehash.hash("ourapp.eth");
console.log(node); // This is your ENS_PARENT_NODE
```

Or use ethers.js:
```javascript
const ethers = require("ethers");
const utils = ethers.utils;

// For "ourapp.eth"
const labels = ["ourapp", "eth"];
let node = "0x0000000000000000000000000000000000000000000000000000000000000000";
for (let i = labels.length - 1; i >= 0; i--) {
  node = utils.keccak256(
    utils.concat([node, utils.keccak256(utils.toUtf8Bytes(labels[i]))])
  );
}
console.log(node);
```

## Current Recommendation

**For now, just leave the ENS variables commented out or empty in your `.env` file.**

The platform works perfectly without ENS - users can still:
- Send and receive tokens
- Use wallet addresses
- Create events and distribute rewards
- Use all core features

ENS is just a "nice-to-have" feature for human-readable names. You can add it later when it's available on Monad.

## Summary

✅ **What to do now**: Nothing - leave ENS variables empty/commented  
✅ **Platform works**: Yes, all features work without ENS  
✅ **When to set them**: When ENS is available on Monad testnet/mainnet  
✅ **Impact**: None - ENS is optional for better UX

