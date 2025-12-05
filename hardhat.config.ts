import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-chai-matchers";
import "@nomicfoundation/hardhat-ethers";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import * as dotenv from "dotenv";

dotenv.config();

/**
 * Hardhat configuration for FHEVM Private Genetic Analysis Example
 *
 * This configuration sets up the development environment for building
 * privacy-preserving genetic analysis smart contracts using Zama's FHEVM.
 *
 * @see https://docs.zama.ai/fhevm for FHEVM documentation
 */
const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      evmVersion: "cancun",
    },
  },

  networks: {
    // Local Hardhat Network for testing
    hardhat: {
      chainId: 31337,
      accounts: {
        count: 10,
        accountsBalance: "10000000000000000000000", // 10000 ETH
      },
    },

    // Sepolia Testnet (for FHEVM deployment)
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://sepolia.infura.io/v3/",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111,
      gasPrice: "auto",
    },

    // Zama Devnet (if available)
    zamaDevnet: {
      url: process.env.ZAMA_DEVNET_RPC_URL || "https://devnet.zama.ai",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 8009,
    },
  },

  // Gas Reporter Configuration
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
    outputFile: "gas-report",
    noColors: true,
    coinmarketcap: process.env.COINMARKETCAP_API_KEY || "",
  },

  // Etherscan Verification
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY || "",
    },
  },

  // Path Configuration
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },

  // Mocha Test Configuration
  mocha: {
    timeout: 100000,
    reporter: "spec",
  },

  // TypeChain Configuration
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6",
  },
};

export default config;
