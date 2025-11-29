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
export const monadTestnet = {
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
export const TOKEN_CONTRACT_ADDRESS = '0xf076E53383868809E8edb21c8DF4fE2F5b58daB2' as `0x${string}` // XToken deployed

// AirdropHelper contract address (deployed on Monad testnet - Latest Deployment)
export const AIRDROP_HELPER_ADDRESS = '0xB477629258566cB79CE0033DA883737953cA7E8c' as `0x${string}` // AirdropHelper deployed

// ENS Subdomain Registrar contract address (not deployed yet - ENS not available on testnet)
export const ENS_REGISTRAR_ADDRESS = '0x0000000000000000000000000000000000000000' as `0x${string}` // Deploy later when ENS is available

// RewardLinkExecutor contract address (deployed on Monad testnet)
export const REWARD_LINK_EXECUTOR_ADDRESS = '0x8C4d6757aBbe89A451488D78219F574CD518c949' as `0x${string}` // RewardLinkExecutor deployed

// SubscriptionScheduler contract address (deployed on Monad testnet)
export const SUBSCRIPTION_SCHEDULER_ADDRESS = '0xE119fC309692Fa06f81Fe324b63df6Af32fd394D' as `0x${string}` // SubscriptionScheduler deployed

