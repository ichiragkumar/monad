# Smart Contracts

This directory contains the Solidity smart contracts for the Monad Micropayments & Loyalty Platform.

## Contracts

### XToken.sol
The main ERC-20 token contract used for all platform transactions:
- P2P micropayments
- Loyalty rewards
- Micro-subscriptions
- Event distributions

**Features:**
- Standard ERC-20 implementation using OpenZeppelin
- Initial supply: 1 billion tokens (minted to deployer)
- Owner can mint additional tokens
- Batch minting for efficient airdrops

**Deployment:**
- Constructor requires: `initialOwner` address
- Initial supply is automatically minted to owner

### AirdropHelper.sol
Helper contract for batch token distributions:
- Allows vendors to distribute tokens to multiple recipients
- Supports equal and variable amount distributions
- Reduces gas costs for bulk operations
- Uses SafeERC20 for secure transfers

**Deployment:**
- No constructor parameters required
- Can be used immediately after deployment

### ENSSubdomainRegistrar.sol
Contract for registering ENS subdomains under a parent domain:
- Users can claim subdomains like `alice.ourapp.eth`
- Name availability checking
- Configurable registration fee
- Owner can withdraw fees

**Deployment Requirements:**
- `_ensRegistry`: Address of ENS Registry contract
- `_resolver`: Address of ENS Resolver contract
- `_parentNode`: Bytes32 hash of parent domain node
- `initialOwner`: Owner address

**Note:** This contract requires ENS infrastructure on Monad. If ENS is not available on Monad testnet, this can be deployed later.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file:
```env
PRIVATE_KEY=your_deployment_private_key
MONAD_TESTNET_RPC=https://testnet-rpc.monad.xyz

# Optional - for ENS deployment
ENS_REGISTRY_ADDRESS=0x...
ENS_RESOLVER_ADDRESS=0x...
ENS_PARENT_NODE=0x...
```

3. Compile contracts:
```bash
npm run compile
```

4. Deploy to Monad testnet:
```bash
# Deploy all contracts
npm run deploy-all

# Or deploy individually
npm run deploy
```

## Deployment

After deployment, update the frontend configuration:
- File: `../src/config/wagmi.ts`
- Variables: `TOKEN_CONTRACT_ADDRESS`, `AIRDROP_HELPER_ADDRESS`, `ENS_REGISTRAR_ADDRESS`

Deployment addresses are automatically saved to `deployments/{network}.json`.

## Network Configuration

Update `hardhat.config.ts` with actual Monad testnet details:
- RPC URL
- Chain ID
- Block explorer URL (for verification)

## Security

- Uses OpenZeppelin's audited contracts
- Follows best practices for access control
- Will undergo security audit before mainnet launch

## Testing

Run tests:
```bash
npm test
```

## Verification

If Monad testnet supports contract verification:
```bash
npm run verify <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

## See Also

- [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md) - Detailed deployment guide
- [Main README](../README.md) - Platform overview
