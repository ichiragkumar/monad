# Setup Guide

This guide will help you set up and run the Monad Micropayments & Loyalty Platform.

## Prerequisites

- **Node.js** 18+ and npm/yarn
- **MetaMask** or compatible Web3 wallet browser extension
- **Git** (for cloning the repository)

## Quick Start

### 1. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install contract dependencies (optional, for deploying contracts)
cd contracts
npm install
cd ..
```

### 2. Configure Environment

Create a `.env` file in the root directory (optional for now, defaults are set):

```env
VITE_MONAD_TESTNET_RPC=https://testnet-rpc.monad.xyz
VITE_MONAD_CHAIN_ID=10143
VITE_TOKEN_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

### 3. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 4. Connect Your Wallet

1. Install MetaMask browser extension if you haven't already
2. Click "Connect Wallet" in the app header
3. Approve the connection request in MetaMask

### 5. Add Monad Testnet to MetaMask

To use the app, you'll need to add Monad testnet to MetaMask:

1. Open MetaMask
2. Go to Settings → Networks → Add Network
3. Enter the following details (update with actual Monad testnet values):
   - **Network Name**: Monad Testnet
   - **RPC URL**: https://testnet-rpc.monad.xyz
   - **Chain ID**: 10143
   - **Currency Symbol**: MON
   - **Block Explorer**: https://testnet-explorer.monad.xyz

## Smart Contract Deployment

### Prerequisites

- Node.js 18+
- Access to Monad testnet with test tokens for gas

### Deploy Contracts

1. Navigate to contracts directory:
```bash
cd contracts
```

2. Create `.env` file:
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

5. Update frontend configuration:
   - Open `src/config/wagmi.ts`
   - Update `TOKEN_CONTRACT_ADDRESS` with the deployed contract address

## Testing the Platform

### As a User

1. **Connect Wallet**: Use the "Connect Wallet" button
2. **Get Test Tokens**: Use the faucet (if available) or request tokens from the team
3. **Send Tokens**: 
   - Go to Wallet page
   - Enter recipient address or ENS name
   - Enter amount
   - Click "Send Tokens"
   - Confirm transaction in MetaMask

### As a Vendor (Phase 2)

1. Navigate to Vendor Dashboard
2. Create an event/program
3. Whitelist participants
4. Distribute rewards

## Troubleshooting

### Wallet Connection Issues

- **MetaMask not detected**: Make sure MetaMask is installed and unlocked
- **Wrong network**: Switch to Monad testnet in MetaMask
- **Transaction fails**: Check that you have enough native tokens for gas

### Build Errors

- **Module not found**: Run `npm install` again
- **Type errors**: Make sure TypeScript is properly configured
- **Import errors**: Check that all dependencies are installed

### Contract Deployment Issues

- **Insufficient funds**: Make sure your deployment account has testnet tokens
- **Network error**: Verify the RPC URL is correct
- **Compilation errors**: Check Solidity version compatibility

## Development Tips

### Hot Reload

The Vite dev server supports hot module replacement. Changes to React components will automatically refresh in the browser.

### TypeScript

The project uses TypeScript for type safety. Make sure your editor is configured to show TypeScript errors.

### Code Structure

- `src/pages/` - Page components
- `src/components/` - Reusable UI components
- `src/config/` - Configuration files
- `src/utils/` - Utility functions
- `contracts/` - Smart contracts

## Next Steps

1. **Deploy Token Contract**: Deploy XToken to Monad testnet
2. **Test Micropayments**: Send test transactions
3. **Implement Phase 2**: Add vendor dashboard features
4. **Add ENS Integration**: Implement subdomain assignment (Phase 3)

## Support

For issues or questions:
- Check the main README.md
- Review contract documentation in `contracts/README.md`
- Contact the development team

## Notes

- The app is currently configured for Monad testnet
- Update network configuration when Monad mainnet details are available
- Token contract address must be updated after deployment
- WalletConnect requires a project ID from walletconnect.com


