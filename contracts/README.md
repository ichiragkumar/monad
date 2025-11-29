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
- Initial supply: 1 billion tokens
- Owner can mint additional tokens
- Batch minting for efficient airdrops

### AirdropHelper.sol
Helper contract for batch token distributions:
- Allows vendors to distribute tokens to multiple recipients
- Supports equal and variable amount distributions
- Reduces gas costs for bulk operations

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file:
```env
PRIVATE_KEY=your_deployment_private_key
MONAD_TESTNET_RPC=https://testnet-rpc.monad.xyz
```

3. Compile contracts:
```bash
npm run compile
```

4. Deploy to Monad testnet:
```bash
npm run deploy
```

## Deployment

After deployment, update the `TOKEN_CONTRACT_ADDRESS` in the frontend configuration:
- File: `src/config/wagmi.ts`
- Variable: `TOKEN_CONTRACT_ADDRESS`

## Security

- Uses OpenZeppelin's audited contracts
- Follows best practices for access control
- Will undergo security audit before mainnet launch

## Network Configuration

Update `hardhat.config.ts` with actual Monad testnet/mainnet details:
- RPC URL
- Chain ID
- Block explorer URL


