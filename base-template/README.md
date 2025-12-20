# FHEVM Hardhat Template

A minimal Hardhat template for building FHEVM (Fully Homomorphic Encryption Virtual Machine) applications.

## Overview

This is a clean, production-ready template for developing privacy-preserving smart contracts using Zama's FHEVM. Use this template as a starting point for your own FHEVM projects.

## Features

- ✅ Hardhat development environment
- ✅ FHEVM Solidity library (@fhevm/solidity)
- ✅ TypeScript support
- ✅ Testing framework with Chai and Mocha
- ✅ Deployment scripts
- ✅ Gas reporting
- ✅ Code formatting (Prettier)
- ✅ Linting (Solhint, ESLint)
- ✅ TypeChain type generation

## Quick Start

### 1. Installation

```bash
# Clone or copy this template
git clone <your-repo-url>
cd fhevm-hardhat-template

# Install dependencies
npm install
```

### 2. Configuration

Copy the environment example file:

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### 3. Development

```bash
# Compile contracts
npm run compile

# Run tests
npm test

# Deploy to local network
npm run deploy

# Deploy to Sepolia testnet
npm run deploy:sepolia
```

## Project Structure

```
.
├── contracts/          # Solidity smart contracts
├── test/              # Test files
├── scripts/           # Utility scripts
├── deploy/            # Deployment scripts
├── hardhat.config.ts  # Hardhat configuration
├── package.json       # Dependencies
├── tsconfig.json      # TypeScript config
└── .env.example       # Environment template
```

## Writing Your First Contract

Create a new contract in `contracts/`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint8 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract MyContract is SepoliaConfig {
    euint8 private encryptedValue;

    function store(uint8 value) external {
        euint8 encrypted = FHE.asEuint8(value);
        FHE.allowThis(encrypted);
        FHE.allow(encrypted, msg.sender);
        encryptedValue = encrypted;
    }
}
```

## Testing

Create tests in `test/`:

```typescript
import { expect } from "chai";
import { ethers } from "hardhat";

describe("MyContract", function () {
    it("Should store encrypted value", async function () {
        const MyContract = await ethers.getContractFactory("MyContract");
        const contract = await MyContract.deploy();
        await contract.waitForDeployment();

        await contract.store(42);
        // Test your contract
    });
});
```

Run tests:

```bash
npm test
```

## Deployment

### Local Network

```bash
# Terminal 1: Start local node
npx hardhat node

# Terminal 2: Deploy
npm run deploy
```

### Sepolia Testnet

```bash
# Ensure .env is configured
npm run deploy:sepolia
```

### Verify on Etherscan

```bash
npx hardhat verify --network sepolia DEPLOYED_ADDRESS
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run compile` | Compile contracts |
| `npm test` | Run tests |
| `npm run test:coverage` | Generate coverage report |
| `npm run deploy` | Deploy to local network |
| `npm run deploy:sepolia` | Deploy to Sepolia testnet |
| `npm run clean` | Clean artifacts |
| `npm run lint` | Lint Solidity files |
| `npm run lint:fix` | Fix linting issues |
| `npm run format` | Format code with Prettier |

## Key FHEVM Concepts

### Encryption

```solidity
euint8 encrypted = FHE.asEuint8(value);
```

### Access Control

```solidity
FHE.allowThis(encrypted);        // Contract permission
FHE.allow(encrypted, msg.sender); // User permission
```

### Homomorphic Operations

```solidity
euint8 sum = FHE.add(a, b);
euint8 product = FHE.mul(a, b);
ebool isEqual = FHE.eq(a, b);
```

### Conditional Operations

```solidity
euint8 result = FHE.select(condition, trueValue, falseValue);
```

## Best Practices

### ✅ DO

- Always call `FHE.allowThis()` after creating encrypted values
- Grant user permissions with `FHE.allow()` when appropriate
- Use descriptive variable names
- Add comprehensive comments
- Test both success and failure cases
- Emit events for important state changes

### ❌ DON'T

- Forget to grant permissions on encrypted values
- Mix encrypted and plaintext operations carelessly
- Skip access control checks
- Trust user input without validation
- Operate on encrypted values without `allowThis()`

## Resources

- **FHEVM Documentation**: https://docs.zama.ai/fhevm
- **Zama GitHub**: https://github.com/zama-ai/fhevm
- **Hardhat Documentation**: https://hardhat.org/docs
- **FHEVM Examples**: https://github.com/zama-ai/fhevm/tree/main/examples

## Support

- [Zama Discord](https://discord.com/invite/zama)
- [FHEVM Forum](https://community.zama.ai/)
- [GitHub Issues](https://github.com/zama-ai/fhevm/issues)

## License

MIT

---

*Built with [FHEVM](https://github.com/zama-ai/fhevm) by Zama*
