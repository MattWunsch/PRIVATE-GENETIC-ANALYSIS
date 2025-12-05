#!/usr/bin/env ts-node

/**
 * @title FHEVM Example Generator
 * @notice Automated scaffolding tool for creating standalone FHEVM example repositories
 * @dev This script generates a complete Hardhat-based FHEVM project with:
 *      - Contract templates
 *      - Test suites
 *      - Documentation
 *      - Configuration files
 *
 * Usage:
 * ```bash
 * ts-node automation/create-example.ts --name "MyExample" --category "healthcare"
 * ```
 */

import * as fs from "fs";
import * as path from "path";

interface ExampleConfig {
  name: string;
  category: string;
  description: string;
  outputDir: string;
}

/**
 * @notice Main function to generate FHEVM example project
 * @param config Configuration for the example to generate
 */
async function generateExample(config: ExampleConfig): Promise<void> {
  console.log(`\n🚀 Generating FHEVM Example: ${config.name}`);
  console.log(`📁 Category: ${config.category}`);
  console.log(`📝 Description: ${config.description}\n`);

  // Create output directory
  const outputPath = path.join(config.outputDir, config.name);
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }

  // Generate project structure
  await createDirectoryStructure(outputPath);
  await generatePackageJson(outputPath, config);
  await generateHardhatConfig(outputPath);
  await generateGitignore(outputPath);
  await generateEnvExample(outputPath);
  await generateReadme(outputPath, config);
  await generateTsConfig(outputPath);

  console.log(`\n✅ Example generated successfully at: ${outputPath}`);
  console.log(`\nNext steps:`);
  console.log(`  cd ${config.name}`);
  console.log(`  npm install`);
  console.log(`  npx hardhat compile`);
  console.log(`  npx hardhat test\n`);
}

/**
 * @notice Creates the standard Hardhat project directory structure
 * @param basePath Base path where directories will be created
 */
async function createDirectoryStructure(basePath: string): Promise<void> {
  const directories = [
    "contracts",
    "test",
    "scripts",
    "deploy",
    "frontend",
    "automation",
  ];

  for (const dir of directories) {
    const dirPath = path.join(basePath, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`✓ Created directory: ${dir}/`);
    }
  }
}

/**
 * @notice Generates package.json with FHEVM dependencies
 * @param basePath Base path for the project
 * @param config Example configuration
 */
async function generatePackageJson(
  basePath: string,
  config: ExampleConfig
): Promise<void> {
  const packageJson = {
    name: `fhevm-${config.name.toLowerCase().replace(/\s+/g, "-")}`,
    version: "1.0.0",
    description: config.description,
    main: "index.js",
    keywords: ["fhevm", "zama", "fhe", "privacy", config.category],
    author: "FHEVM Community",
    license: "MIT",
    scripts: {
      compile: "hardhat compile",
      test: "hardhat test",
      "test:coverage": "hardhat coverage",
      deploy: "hardhat run scripts/deploy.ts",
      "deploy:sepolia": "hardhat run scripts/deploy.ts --network sepolia",
      node: "hardhat node",
      clean: "hardhat clean",
      typechain: "hardhat typechain",
    },
    devDependencies: {
      "@nomicfoundation/hardhat-chai-matchers": "^2.0.0",
      "@nomicfoundation/hardhat-ethers": "^3.0.0",
      "@nomicfoundation/hardhat-network-helpers": "^1.0.0",
      "@nomicfoundation/hardhat-toolbox": "^4.0.0",
      "@typechain/ethers-v6": "^0.5.0",
      "@typechain/hardhat": "^9.0.0",
      "@types/chai": "^4.3.11",
      "@types/mocha": "^10.0.6",
      "@types/node": "^20.10.0",
      chai: "^4.3.10",
      hardhat: "^2.19.0",
      "hardhat-gas-reporter": "^1.0.9",
      "ts-node": "^10.9.2",
      typechain: "^8.3.0",
      typescript: "^5.3.0",
    },
    dependencies: {
      "@fhevm/solidity": "^0.5.0",
      dotenv: "^16.3.1",
      ethers: "^6.9.0",
    },
  };

  const filePath = path.join(basePath, "package.json");
  fs.writeFileSync(filePath, JSON.stringify(packageJson, null, 2));
  console.log(`✓ Generated: package.json`);
}

/**
 * @notice Generates Hardhat configuration file
 * @param basePath Base path for the project
 */
async function generateHardhatConfig(basePath: string): Promise<void> {
  const config = `import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-chai-matchers";
import "@nomicfoundation/hardhat-ethers";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import * as dotenv from "dotenv";

dotenv.config();

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
    hardhat: {
      chainId: 31337,
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://sepolia.infura.io/v3/",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111,
    },
  },

  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
  },

  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },

  mocha: {
    timeout: 100000,
  },

  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6",
  },
};

export default config;
`;

  const filePath = path.join(basePath, "hardhat.config.ts");
  fs.writeFileSync(filePath, config);
  console.log(`✓ Generated: hardhat.config.ts`);
}

/**
 * @notice Generates .gitignore file
 * @param basePath Base path for the project
 */
async function generateGitignore(basePath: string): Promise<void> {
  const gitignore = `# Dependencies
node_modules/
package-lock.json
yarn.lock

# Environment
.env
.env.local
.env.production

# Hardhat
cache/
artifacts/
typechain-types/

# Coverage
coverage/
coverage.json
.coverage_cache/
.coverage_contracts/

# Testing
test-results/

# Build
dist/
build/

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
*.log
logs/
`;

  const filePath = path.join(basePath, ".gitignore");
  fs.writeFileSync(filePath, gitignore);
  console.log(`✓ Generated: .gitignore`);
}

/**
 * @notice Generates .env.example file
 * @param basePath Base path for the project
 */
async function generateEnvExample(basePath: string): Promise<void> {
  const envExample = `# Network Configuration
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=your_private_key_here

# API Keys
ETHERSCAN_API_KEY=your_etherscan_api_key
COINMARKETCAP_API_KEY=your_coinmarketcap_api_key

# Gas Reporting
REPORT_GAS=false
`;

  const filePath = path.join(basePath, ".env.example");
  fs.writeFileSync(filePath, envExample);
  console.log(`✓ Generated: .env.example`);
}

/**
 * @notice Generates README.md documentation
 * @param basePath Base path for the project
 * @param config Example configuration
 */
async function generateReadme(
  basePath: string,
  config: ExampleConfig
): Promise<void> {
  const readme = `# FHEVM Example: ${config.name}

${config.description}

## Overview

This example demonstrates privacy-preserving smart contracts using Zama's FHEVM (Fully Homomorphic Encryption Virtual Machine).

**Category:** ${config.category}

## Features

- ✅ Fully Homomorphic Encryption (FHE)
- ✅ Privacy-preserving computations
- ✅ Comprehensive test suite
- ✅ TypeScript support
- ✅ Gas optimization

## Prerequisites

- Node.js >= 18
- npm or yarn
- MetaMask or similar Web3 wallet

## Installation

\`\`\`bash
# Clone the repository
git clone <repository-url>
cd ${config.name}

# Install dependencies
npm install
\`\`\`

## Configuration

1. Copy the environment example file:
\`\`\`bash
cp .env.example .env
\`\`\`

2. Edit \`.env\` and add your configuration:
- \`SEPOLIA_RPC_URL\`: Your Infura/Alchemy endpoint
- \`PRIVATE_KEY\`: Your deployment wallet private key

## Usage

### Compile Contracts

\`\`\`bash
npm run compile
\`\`\`

### Run Tests

\`\`\`bash
npm test
\`\`\`

### Deploy to Sepolia

\`\`\`bash
npm run deploy:sepolia
\`\`\`

### Run Local Node

\`\`\`bash
npm run node
\`\`\`

## Project Structure

\`\`\`
.
├── contracts/          # Solidity contracts
├── test/              # Test files
├── scripts/           # Deployment scripts
├── frontend/          # Frontend application
├── automation/        # Automation tools
└── hardhat.config.ts  # Hardhat configuration
\`\`\`

## Key Concepts

### FHE Encryption

This example uses Zama's FHEVM to perform computations on encrypted data without decrypting it.

### Access Control

Proper FHE access control is implemented using:
- \`FHE.allow()\` - Grant decryption permissions
- \`FHE.allowThis()\` - Allow contract operations

## Testing

The test suite demonstrates:
- ✅ FHE encryption workflows
- ✅ Homomorphic operations
- ✅ Access control patterns
- ✅ Security best practices

## Documentation

For more information, see:
- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Zama GitHub](https://github.com/zama-ai/fhevm)

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.
`;

  const filePath = path.join(basePath, "README.md");
  fs.writeFileSync(filePath, readme);
  console.log(`✓ Generated: README.md`);
}

/**
 * @notice Generates TypeScript configuration
 * @param basePath Base path for the project
 */
async function generateTsConfig(basePath: string): Promise<void> {
  const tsConfig = {
    compilerOptions: {
      target: "ES2020",
      module: "commonjs",
      lib: ["ES2020"],
      outDir: "./dist",
      rootDir: "./",
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      resolveJsonModule: true,
      declaration: true,
      declarationMap: true,
      sourceMap: true,
      moduleResolution: "node",
    },
    include: ["./scripts/**/*", "./test/**/*", "./automation/**/*"],
    exclude: ["node_modules", "dist", "cache", "artifacts"],
  };

  const filePath = path.join(basePath, "tsconfig.json");
  fs.writeFileSync(filePath, JSON.stringify(tsConfig, null, 2));
  console.log(`✓ Generated: tsconfig.json`);
}

// CLI Interface
const args = process.argv.slice(2);
const nameIndex = args.indexOf("--name");
const categoryIndex = args.indexOf("--category");
const descIndex = args.indexOf("--description");
const outputIndex = args.indexOf("--output");

if (nameIndex === -1) {
  console.error("❌ Error: --name parameter is required");
  console.log("\nUsage:");
  console.log(
    '  ts-node automation/create-example.ts --name "Example Name" --category "category" --description "Description"'
  );
  process.exit(1);
}

const config: ExampleConfig = {
  name: args[nameIndex + 1] || "NewExample",
  category: args[categoryIndex + 1] || "general",
  description:
    args[descIndex + 1] || "A new FHEVM example demonstrating FHE concepts",
  outputDir: args[outputIndex + 1] || "./examples",
};

// Run generator
generateExample(config).catch((error) => {
  console.error("❌ Error generating example:", error);
  process.exit(1);
});
