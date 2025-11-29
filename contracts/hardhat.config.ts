import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    monadTestnet: {
      url: process.env.MONAD_TESTNET_RPC || (() => {
        throw new Error(
          "MONAD_TESTNET_RPC environment variable is required!\n" +
          "Please set it in your .env file:\n" +
          "MONAD_TESTNET_RPC=https://your-monad-testnet-rpc-url\n\n" +
          "Check Monad documentation for the official testnet RPC URL."
        );
      })(),
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: parseInt(process.env.MONAD_CHAIN_ID || "10143"), // Update with actual Monad testnet chain ID
    },
  },
};

export default config;


