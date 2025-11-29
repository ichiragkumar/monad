import { createConfig, http } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { metaMask, walletConnect } from 'wagmi/connectors'

// Monad Testnet configuration
// Note: Update with actual Monad testnet details when available
const monadTestnet = {
  id: 10143, // Placeholder - update with actual chain ID
  name: 'Monad Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Monad',
    symbol: 'MON',
  },
  rpcUrls: {
    default: {
      http: ['https://testnet-rpc.monad.xyz'], // Placeholder - update with actual RPC
    },
  },
  blockExplorers: {
    default: {
      name: 'Monad Explorer',
      url: 'https://testnet-explorer.monad.xyz', // Placeholder
    },
  },
  testnet: true,
} as const

export const config = createConfig({
  chains: [monadTestnet, sepolia],
  connectors: [
    metaMask({
      dappMetadata: {
        name: 'Monad Micropayments Platform',
      },
    }),
    walletConnect({
      projectId: 'YOUR_WALLETCONNECT_PROJECT_ID', // Replace with actual project ID
    }),
  ],
  transports: {
    [monadTestnet.id]: http(),
    [sepolia.id]: http(),
  },
})

// Token contract address (will be deployed on Monad testnet)
export const TOKEN_CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000' // Update after deployment

// AirdropHelper contract address (update after deployment)
export const AIRDROP_HELPER_ADDRESS = '0x0000000000000000000000000000000000000000' // Update after deployment

// ENS Subdomain Registrar contract address (update after deployment)
export const ENS_REGISTRAR_ADDRESS = '0x0000000000000000000000000000000000000000' // Update after deployment

