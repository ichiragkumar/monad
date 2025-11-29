import { createConfig, http } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { connectorsForWallets } from '@rainbow-me/rainbowkit'
import {
  metaMaskWallet,
  braveWallet,
  phantomWallet,
  coinbaseWallet,
  walletConnectWallet,
  safeWallet,
  injectedWallet,
} from '@rainbow-me/rainbowkit/wallets'

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
      url: 'https://monad-testnet.socialscan.io/', // Placeholder
    },
  },
  testnet: true,
} as const

// Configure wallets using RainbowKit's connectorsForWallets
const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [
        metaMaskWallet,
        coinbaseWallet,
        walletConnectWallet,
      ],
    },
    {
      groupName: 'Installed',
      wallets: [
        braveWallet,
        phantomWallet,
        injectedWallet,
      ],
    },
    {
      groupName: 'More',
      wallets: [
        safeWallet,
      ],
    },
  ],
  {
    appName: 'Monad Micropayments Platform',
    projectId: 'cb5be958d603567487c52cd49e585965',
  }
)

export const config = createConfig({
  chains: [monadTestnet, sepolia],
  connectors,
  transports: {
    [monadTestnet.id]: http('https://testnet-rpc.monad.xyz', {
      timeout: 30000, // 30 second timeout
      retryCount: 3,
      retryDelay: 1000,
    }),
    [sepolia.id]: http(),
  },
})

// Token contract address (deployed on Monad testnet - Latest Deployment)
export const TOKEN_CONTRACT_ADDRESS = '0x151310CEAC3686C08c83E423a7E5Bf4EC04b3bD3' // XToken deployed

// AirdropHelper contract address (deployed on Monad testnet - Latest Deployment)
export const AIRDROP_HELPER_ADDRESS = '0x41155e50E49a189De6A464fe9b9b79009A057e99' // AirdropHelper deployed

// ENS Subdomain Registrar contract address (not deployed yet - ENS not available on testnet)
export const ENS_REGISTRAR_ADDRESS = '0x0000000000000000000000000000000000000000' // Deploy later when ENS is available

