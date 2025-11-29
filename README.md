# Monad Micropayments & Loyalty Rewards Platform

A web-based platform for micropayments, peer-to-peer transfers, and loyalty rewards built on the Monad blockchain. This platform enables instant, low-cost transactions perfect for splitting bills, tipping creators, and distributing tokenized rewards.

## Features

### Phase 1: Core Wallet & Micropayments ✅
- ✅ Wallet connection (MetaMask, WalletConnect)
- ✅ Token balance display
- ✅ Send tokens (P2P micropayments)
- ✅ Transaction history (blockchain-fetched)
- ✅ Monad testnet integration
- ✅ Error boundary and loading states

### Phase 2: Loyalty & Rewards ✅
- ✅ Vendor dashboard with statistics
- ✅ Event/program creation
- ✅ Participant whitelisting (individual + CSV import)
- ✅ Bulk token distribution (equal & variable amounts)
- ✅ Smart contract integration (AirdropHelper)
- ✅ Approval flow and transaction tracking

### Phase 3: ENS Integration ✅
- ✅ ENS subdomain assignment
- ✅ Human-readable usernames
- ✅ ENS registration UI
- ✅ ENS subdomain registrar contract

### Phase 4: Mainnet Launch (Planned)
- Security audits
- Mainnet deployment
- Production monitoring

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Web3**: Wagmi + Viem + RainbowKit
- **Smart Contracts**: Solidity (OpenZeppelin)
- **Blockchain**: Monad Testnet → Mainnet

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- MetaMask or compatible Web3 wallet
- Access to Monad testnet (for testing)

### Installation

1. Clone the repository:
```bash
cd fe
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

### Smart Contract Deployment

1. Navigate to the contracts directory:
```bash
cd contracts
```

2. Install contract dependencies:
```bash
npm install
```

3. Create a `.env` file with your deployment configuration:
```env
PRIVATE_KEY=your_private_key_here
MONAD_TESTNET_RPC=https://testnet-rpc.monad.xyz
```

4. Compile contracts:
```bash
npm run compile
```

5. Deploy all contracts to Monad testnet:
```bash
npm run deploy
```

   Or deploy individually:
```bash
npx hardhat run scripts/deploy.ts --network monadTestnet
npx hardhat run scripts/deploy-all.ts --network monadTestnet
```

6. Update contract addresses in `src/config/wagmi.ts`:
   - `TOKEN_CONTRACT_ADDRESS`
   - `AIRDROP_HELPER_ADDRESS`
   - `ENS_REGISTRAR_ADDRESS` (if deployed)

   Deployment addresses are saved in `contracts/deployments/{network}.json`

## Project Structure

```
fe/
├── src/
│   ├── components/       # Reusable UI components
│   ├── pages/            # Page components (Home, Wallet, Vendor)
│   ├── config/           # Wagmi configuration
│   └── main.tsx          # App entry point
├── contracts/            # Smart contracts (Solidity)
│   ├── XToken.sol        # ERC-20 token contract
│   └── AirdropHelper.sol # Batch distribution helper
└── public/               # Static assets
```

## Configuration

### Monad Network Setup

The app is configured to work with Monad testnet. To add Monad to MetaMask:

1. Open MetaMask
2. Go to Settings → Networks → Add Network
3. Use the following details (update with actual Monad testnet values):
   - Network Name: Monad Testnet
   - RPC URL: https://testnet-rpc.monad.xyz
   - Chain ID: 10143
   - Currency Symbol: MON

### WalletConnect

To enable WalletConnect, update `YOUR_WALLETCONNECT_PROJECT_ID` in `src/config/wagmi.ts` with your project ID from [WalletConnect Cloud](https://cloud.walletconnect.com/).

## Usage

### For Users

1. **Connect Wallet**: Click "Connect Wallet" in the header
2. **View Balance**: Your X Token and native token balances are displayed
3. **Send Tokens**: Enter recipient address (or ENS name) and amount, then click "Send Tokens"
4. **View History**: Check your recent transactions in the transaction history section

### For Vendors

1. **Access Dashboard**: Navigate to "Vendor Dashboard" (Phase 2 feature)
2. **Create Events**: Set up loyalty programs or event reward systems
3. **Whitelist Participants**: Add participant addresses
4. **Distribute Rewards**: Bulk distribute tokens to participants

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Smart Contract Scripts

- `npm run compile` - Compile Solidity contracts
- `npm run test` - Run contract tests
- `npm run deploy` - Deploy contracts to network

## Architecture

### Token Model

The platform uses a unified ERC-20 token (X Token) for:
- P2P micropayments
- Loyalty rewards
- Micro-subscriptions
- Event distributions

This simplifies the system and allows tokens to be fungible across different use cases.

### Network Performance

Monad's high-performance infrastructure enables:
- **10,000+ TPS**: Handle thousands of transactions per second
- **<1s Finality**: Transactions confirm in under a second
- **~$0.001 Fees**: Negligible transaction costs make micropayments viable

## Security Considerations

- Smart contracts use OpenZeppelin's audited libraries
- Non-custodial: Users control their own wallets
- All transactions are on-chain and transparent
- Phase 4 will include comprehensive security audits before mainnet launch

## Roadmap

- [x] Phase 1: Core wallet & micropayments
- [ ] Phase 2: Loyalty & rewards mechanics
- [ ] Phase 3: ENS integration & UX polish
- [ ] Phase 4: Testing, security, mainnet launch

## Contributing

This is a hackathon project. Contributions and feedback are welcome!

## License

MIT

## Resources

- [Monad Documentation](https://www.monad.xyz/)
- [Wagmi Documentation](https://wagmi.sh/)
- [RainbowKit Documentation](https://www.rainbowkit.com/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)


