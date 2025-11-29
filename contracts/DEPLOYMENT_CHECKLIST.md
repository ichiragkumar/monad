# Deployment Checklist for Monad Testnet

## ✅ Pre-Deployment Verification

### Contracts Status
- ✅ **XToken.sol** - Complete and ready
  - Uses OpenZeppelin ERC20 and Ownable
  - Initial supply: 1 billion tokens
  - Minting functions included
  
- ✅ **AirdropHelper.sol** - Complete and ready
  - Uses SafeERC20 for secure transfers
  - Supports equal and variable amount distributions
  
- ⚠️ **ENSSubdomainRegistrar.sol** - Ready but requires ENS setup
  - Needs ENS Registry address
  - Needs ENS Resolver address
  - Needs parent node (bytes32)
  - Can be deployed later if ENS not available on Monad testnet

### Configuration Required

1. **Monad Testnet Details** (Update in `hardhat.config.ts`):
   - [ ] Actual RPC URL (currently placeholder: `https://testnet-rpc.monad.xyz`)
   - [ ] Actual Chain ID (currently placeholder: `10143`)
   - [ ] Block Explorer URL (for verification)

2. **Environment Variables** (Create `.env` file):
   ```env
   PRIVATE_KEY=your_deployment_private_key_here
   MONAD_TESTNET_RPC=https://actual-testnet-rpc.monad.xyz
   
   # Optional - for ENS deployment
   ENS_REGISTRY_ADDRESS=0x...
   ENS_RESOLVER_ADDRESS=0x...
   ENS_PARENT_NODE=0x...
   ```

3. **Deployment Account**:
   - [ ] Account has testnet tokens (MON) for gas fees
   - [ ] Private key is secure and backed up

## 📋 Deployment Steps

### Step 1: Install Dependencies
```bash
cd contracts
npm install
```

### Step 2: Compile Contracts
```bash
npm run compile
```

This will:
- Compile all Solidity contracts
- Check for compilation errors
- Generate artifacts in `artifacts/` directory

### Step 3: Verify Configuration
```bash
# Check hardhat config
cat hardhat.config.ts

# Verify .env file exists (don't commit it!)
ls -la .env
```

### Step 4: Deploy Contracts

**Option A: Deploy All Contracts (Recommended)**
```bash
npm run deploy-all
```

This will deploy:
1. XToken
2. AirdropHelper
3. ENSSubdomainRegistrar (if env vars are set)

**Option B: Deploy Individually**
```bash
# Deploy XToken only
npx hardhat run scripts/deploy.ts --network monadTestnet
```

### Step 5: Verify Deployment

After deployment, you'll see output like:
```
✓ XToken deployed to: 0x...
✓ AirdropHelper deployed to: 0x...
```

**Save these addresses!**

### Step 6: Update Frontend Configuration

Update `src/config/wagmi.ts`:
```typescript
export const TOKEN_CONTRACT_ADDRESS = '0x...' // From deployment
export const AIRDROP_HELPER_ADDRESS = '0x...' // From deployment
export const ENS_REGISTRAR_ADDRESS = '0x...' // From deployment (if deployed)
```

### Step 7: Verify Contracts (Optional)

If Monad testnet has a block explorer with verification:
```bash
npm run verify <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

## 🔍 Post-Deployment Verification

### Test XToken
1. Check initial supply was minted to deployer
2. Test transfer function
3. Verify balance

### Test AirdropHelper
1. Approve AirdropHelper to spend tokens
2. Test airdropEqual with 2-3 addresses
3. Test airdropVariable with different amounts
4. Verify all recipients received tokens

### Test ENSSubdomainRegistrar (if deployed)
1. Check if subdomain is available
2. Register a test subdomain
3. Verify subdomain resolves correctly

## ⚠️ Important Notes

1. **ENS Contract**: ENSSubdomainRegistrar requires ENS infrastructure on Monad. If ENS is not available on Monad testnet, you can skip this contract for now.

2. **Gas Costs**: Monad has low fees, but ensure your deployment account has sufficient balance.

3. **Contract Verification**: If Monad testnet has contract verification, verify contracts after deployment for transparency.

4. **Security**: 
   - Never commit `.env` file
   - Keep private keys secure
   - Consider using a hardware wallet for mainnet

5. **Deployment Addresses**: The `deploy-all.ts` script saves addresses to `deployments/{network}.json` for reference.

## 🐛 Troubleshooting

### Compilation Errors
- Ensure OpenZeppelin contracts are installed: `npm install @openzeppelin/contracts`
- Check Solidity version matches (0.8.20)

### Deployment Errors
- Verify RPC URL is correct and accessible
- Check account has sufficient balance for gas
- Verify chain ID matches Monad testnet

### Network Connection Issues
- Test RPC connection: `curl https://testnet-rpc.monad.xyz`
- Check if you need to whitelist your IP
- Verify network configuration in hardhat.config.ts

## 📝 Deployment Output Example

```
============================================================
Deploying Monad Micropayments Platform Contracts
============================================================

Deploying with account: 0x...
Account balance: 1.5 ETH

1. Deploying XToken...
   ✓ XToken deployed to: 0x1234...

2. Deploying AirdropHelper...
   ✓ AirdropHelper deployed to: 0x5678...

3. Skipping ENSSubdomainRegistrar (missing env variables)

============================================================
Deployment Summary
============================================================
{
  "network": "monadTestnet",
  "chainId": "10143",
  "deployer": "0x...",
  "contracts": {
    "XToken": "0x1234...",
    "AirdropHelper": "0x5678..."
  },
  "timestamp": "2025-01-XX..."
}

✓ Deployment info saved to: contracts/deployments/monadTestnet.json

⚠️  IMPORTANT: Update contract addresses in src/config/wagmi.ts
============================================================
```

## ✅ Ready to Deploy?

Before deploying, ensure:
- [x] Contracts compile without errors
- [x] `.env` file is configured
- [x] Deployment account has testnet tokens
- [x] RPC URL and Chain ID are correct
- [x] You've reviewed all contracts

**You're ready to deploy!** 🚀

