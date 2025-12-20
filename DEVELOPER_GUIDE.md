# Developer Guide - Private Genetic Analysis

This guide provides comprehensive information for developers who want to maintain, extend, or create similar FHEVM examples based on this project.

## Table of Contents

- [Project Architecture](#project-architecture)
- [Adding New Examples](#adding-new-examples)
- [Updating Dependencies](#updating-dependencies)
- [Documentation Workflow](#documentation-workflow)
- [Testing Guidelines](#testing-guidelines)
- [Deployment Procedures](#deployment-procedures)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

---

## Project Architecture

### Directory Structure

```
PrivateGeneticAnalysis/
├── contracts/              # Solidity smart contracts
│   └── PrivateGeneticAnalysis.sol
├── test/                   # TypeScript test files
│   └── PrivateGeneticAnalysis.test.ts
├── scripts/                # Deployment scripts
│   └── deploy.ts
├── automation/             # Code generation tools
│   ├── create-example.ts   # Example scaffolding tool
│   └── generate-docs.ts    # Documentation generator
├── frontend/               # Web interface
│   ├── index.html
│   ├── app.js
│   └── styles.css
├── docs/                   # Auto-generated documentation
└── Configuration files
```

### Key Technologies

- **Solidity 0.8.24** - Smart contract language
- **Hardhat** - Development environment
- **TypeScript** - Testing and tooling
- **FHEVM (@fhevm/solidity ^0.5.0)** - Fully Homomorphic Encryption library
- **Ethers.js v6** - Blockchain interaction

---

## Adding New Examples

### Using the Scaffolding Tool

The `automation/create-example.ts` script automates the creation of new FHEVM example projects.

#### Basic Usage

```bash
# Generate a new example
ts-node automation/create-example.ts \
  --name "MyNewExample" \
  --category "defi" \
  --description "A DeFi example using FHEVM" \
  --output "./examples"
```

#### Parameters

- `--name`: The name of your example (e.g., "ConfidentialVoting")
- `--category`: Category (healthcare, defi, governance, gaming, etc.)
- `--description`: Short description of what the example demonstrates
- `--output`: Output directory (default: `./examples`)

#### What Gets Generated

The scaffolding tool creates:

1. **Directory structure** - contracts/, test/, scripts/, automation/, frontend/
2. **package.json** - With FHEVM dependencies and npm scripts
3. **hardhat.config.ts** - Hardhat configuration with proper compiler settings
4. **tsconfig.json** - TypeScript configuration
5. **.gitignore** - Git ignore rules
6. **.env.example** - Environment template
7. **README.md** - Basic documentation template

### Manual Example Creation

If you prefer to create examples manually:

1. **Create Contract**
   ```bash
   # Create new contract file
   touch contracts/MyExample.sol
   ```

2. **Add FHEVM Imports**
   ```solidity
   // SPDX-License-Identifier: MIT
   pragma solidity ^0.8.24;

   import { FHE, euint8, euint16, ebool } from "@fhevm/solidity/lib/FHE.sol";
   import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

   contract MyExample is SepoliaConfig {
       // Your contract code
   }
   ```

3. **Create Test File**
   ```bash
   touch test/MyExample.test.ts
   ```

4. **Add Test Structure**
   ```typescript
   import { expect } from "chai";
   import { ethers } from "hardhat";

   /**
    * @title MyExample Test Suite
    * @notice Description of what this example demonstrates
    * @chapter my-example
    * @category your-category
    */
   describe("MyExample", function () {
       // Your tests
   });
   ```

---

## Updating Dependencies

### FHEVM Library Updates

When Zama releases a new version of `@fhevm/solidity`:

#### Step 1: Update package.json

```bash
npm install @fhevm/solidity@latest
```

#### Step 2: Check for Breaking Changes

Review the Zama changelog:
- https://github.com/zama-ai/fhevm/releases
- https://docs.zama.ai/fhevm/changelog

#### Step 3: Update Imports

Check if import paths have changed:

```solidity
// Old (example)
import { FHE } from "@fhevm/solidity/FHE.sol";

// New (example)
import { FHE } from "@fhevm/solidity/lib/FHE.sol";
```

#### Step 4: Update Configuration

Check if `SepoliaConfig` or other config files have changed:

```solidity
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";
```

#### Step 5: Run Tests

```bash
npm run compile
npm test
```

#### Step 6: Update Documentation

If APIs changed, regenerate documentation:

```bash
npm run generate:docs
```

### Hardhat Updates

```bash
# Update Hardhat and related packages
npm update hardhat @nomicfoundation/hardhat-toolbox
npm run clean
npm run compile
npm test
```

### Node.js Version Updates

This project requires Node.js >= 18.

Update `.nvmrc` if present:
```
18.0.0
```

---

## Documentation Workflow

### Automated Documentation Generation

The `automation/generate-docs.ts` script extracts documentation from code annotations.

#### Generate Documentation

```bash
# Generate docs from test file annotations
npm run generate:docs
```

This creates:
- `docs/PrivateGeneticAnalysis.md` - Main documentation
- `docs/README.md` - Documentation index

#### Documentation Tags

Use these JSDoc tags in your test files:

```typescript
/**
 * @title Section Title
 * @notice User-facing description
 * @dev Developer implementation notes
 * @chapter chapter-name
 * @category category-name
 * @complexity basic|intermediate|advanced
 */
```

#### Example Documentation Pattern

```typescript
/**
 * @title FHE Encryption Workflow
 * @notice Demonstrates how to encrypt data using FHEVM
 * @dev This test shows the complete workflow:
 *      1. Create plaintext data
 *      2. Encrypt using FHE.asEuint8()
 *      3. Grant permissions with FHE.allowThis()
 *      4. Store encrypted data on-chain
 * @chapter encryption
 * @category basics
 */
it("Should encrypt and store data correctly", async function () {
    // Test implementation
});
```

### GitBook Integration

To publish to GitBook:

1. Create GitBook space
2. Connect GitHub repository
3. Point to `docs/` directory
4. Enable auto-sync on git push

---

## Testing Guidelines

### Test Structure

Follow this pattern for comprehensive test coverage:

```typescript
describe("Feature Category", function () {
    describe("Specific Function", function () {
        it("Should handle normal case", async function () {
            // Test normal operation
        });

        it("Should reject invalid inputs", async function () {
            // Test error handling
        });

        it("Should enforce access control", async function () {
            // Test permissions
        });
    });
});
```

### FHEVM Testing Best Practices

#### 1. Test Both Encrypted and Plaintext Scenarios

```typescript
it("Should handle encrypted data", async function () {
    const encryptedValue = await contract.submitEncrypted(data);
    // Verify encrypted operations
});

it("Should produce same result as plaintext", async function () {
    // Compare FHE result with known plaintext result
});
```

#### 2. Test Access Control Patterns

```typescript
it("Should grant correct permissions", async function () {
    await contract.storeData(value);
    // Verify FHE.allowThis() and FHE.allow() were called
});

it("Should reject unauthorized access", async function () {
    await expect(
        contract.connect(unauthorized).accessData()
    ).to.be.reverted;
});
```

#### 3. Test Anti-Patterns

Include tests that demonstrate common mistakes:

```typescript
it("Should demonstrate missing allowThis anti-pattern", async function () {
    // Show what happens without proper permissions
    // Include explanatory comments
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npx hardhat test test/PrivateGeneticAnalysis.test.ts

# Run specific test suite
npx hardhat test --grep "DNA Sample Submission"

# Run with gas reporting
REPORT_GAS=true npm test

# Generate coverage report
npm run test:coverage
```

### Gas Optimization Testing

```bash
# Enable gas reporter
REPORT_GAS=true npm test

# Review gas usage in output
# Optimize functions with high gas costs
```

---

## Deployment Procedures

### Local Deployment

#### Step 1: Start Local Node

```bash
# Terminal 1
npx hardhat node
```

#### Step 2: Deploy Contract

```bash
# Terminal 2
npx hardhat run scripts/deploy.ts --network localhost
```

#### Step 3: Update Frontend

Edit `frontend/app.js`:
```javascript
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
```

### Testnet Deployment (Sepolia)

#### Step 1: Configure Environment

Create `.env`:
```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key
```

#### Step 2: Get Testnet ETH

Visit [Sepolia Faucet](https://sepoliafaucet.com/) to get test ETH.

#### Step 3: Deploy

```bash
npx hardhat run scripts/deploy.ts --network sepolia
```

#### Step 4: Verify on Etherscan

```bash
npx hardhat verify --network sepolia DEPLOYED_ADDRESS
```

### Mainnet Deployment Checklist

Before deploying to mainnet:

- [ ] Complete security audit
- [ ] Full test coverage (>95%)
- [ ] Gas optimization
- [ ] Emergency pause functionality tested
- [ ] Access control verified
- [ ] Multi-sig wallet for owner functions
- [ ] Monitoring and alerting set up
- [ ] Incident response plan prepared
- [ ] Legal review completed
- [ ] Documentation finalized

---

## Troubleshooting

### Common Issues

#### 1. Compilation Errors

**Issue:** Contract fails to compile

**Solutions:**
```bash
# Clean and rebuild
npm run clean
npm run compile

# Check Solidity version in hardhat.config.ts
# Should be: solidity: "0.8.24"

# Verify FHEVM imports
# import { FHE } from "@fhevm/solidity/lib/FHE.sol";
```

#### 2. Test Failures

**Issue:** Tests fail unexpectedly

**Solutions:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check network configuration
# Ensure hardhat network is configured correctly

# Verify account balances
# Some tests may require funded accounts
```

#### 3. FHE Permission Errors

**Issue:** "Permission denied" errors in FHE operations

**Solution:**
```solidity
// Always grant permissions after creating encrypted values
euint8 value = FHE.asEuint8(42);
FHE.allowThis(value);           // Contract permission
FHE.allow(value, msg.sender);   // User permission
```

#### 4. Documentation Generation Fails

**Issue:** `npm run generate:docs` produces errors

**Solutions:**
```bash
# Ensure test files have proper JSDoc comments
# Check for syntax errors in comments

# Verify output directory exists
mkdir -p docs

# Run manually for debugging
ts-node automation/generate-docs.ts
```

#### 5. Frontend Connection Issues

**Issue:** Frontend can't connect to MetaMask or contract

**Solutions:**
```javascript
// Check contract address in app.js
const CONTRACT_ADDRESS = "0x..."; // Must match deployed address

// Verify network in MetaMask matches deployment
// Sepolia: Chain ID 11155111
// Localhost: Chain ID 31337

// Check contract ABI is up-to-date
// Copy from: artifacts/contracts/PrivateGeneticAnalysis.sol/PrivateGeneticAnalysis.json
```

---

## Best Practices

### Smart Contract Development

#### 1. Always Use Access Control

```solidity
modifier onlyOwner() {
    require(msg.sender == owner, "Not authorized");
    _;
}

function sensitiveFunction() external onlyOwner {
    // Protected function
}
```

#### 2. Grant FHE Permissions Correctly

```solidity
// ✅ CORRECT
euint8 value = FHE.asEuint8(data);
FHE.allowThis(value);
FHE.allow(value, msg.sender);

// ❌ WRONG - Missing allowThis
euint8 value = FHE.asEuint8(data);
FHE.allow(value, msg.sender);
```

#### 3. Validate Inputs

```solidity
function updateValue(uint8 newValue) external {
    require(newValue <= 100, "Value must be <= 100");
    require(newValue >= 0, "Value must be >= 0");
    // Process value
}
```

#### 4. Use Events for Important State Changes

```solidity
event DataSubmitted(address indexed user, uint256 timestamp);

function submitData(uint8 data) external {
    // Process data
    emit DataSubmitted(msg.sender, block.timestamp);
}
```

### Testing Best Practices

#### 1. Test All Code Paths

```typescript
it("Should handle success case", async function () {});
it("Should handle error case", async function () {});
it("Should handle edge cases", async function () {});
```

#### 2. Use Descriptive Test Names

```typescript
// ✅ GOOD
it("Should reject duplicate DNA sample submissions from the same patient", async function () {});

// ❌ BAD
it("Should reject duplicates", async function () {});
```

#### 3. Include Setup and Teardown

```typescript
beforeEach(async function () {
    // Setup before each test
});

afterEach(async function () {
    // Cleanup after each test
});
```

### Documentation Best Practices

#### 1. Document Intent, Not Just Mechanics

```typescript
/**
 * @notice Encrypts and stores patient DNA sequence
 * @dev This demonstrates the core FHE workflow:
 *      Why: DNA data must remain private on-chain
 *      How: Use FHE.asEuint8() to encrypt each nucleotide
 *      Security: Grant permissions to both contract and patient
 */
```

#### 2. Include Code Examples

```typescript
/**
 * @example
 * const dna = [65, 84, 67, 71, ...]; // ATCG sequence
 * await contract.submitGeneticSample(dna);
 */
```

#### 3. Link to External Resources

```typescript
/**
 * @see https://docs.zama.ai/fhevm for FHEVM documentation
 * @see https://docs.zama.ai/protocol/examples for more examples
 */
```

### Git Workflow

#### 1. Commit Messages

```bash
# ✅ GOOD
git commit -m "feat: Add disease marker update functionality"
git commit -m "fix: Correct access control in lab authorization"
git commit -m "docs: Update README with deployment instructions"

# ❌ BAD
git commit -m "updates"
git commit -m "fixed stuff"
```

#### 2. Branch Naming

```bash
# Feature branches
git checkout -b feature/multi-disease-analysis

# Bug fixes
git checkout -b fix/permission-error

# Documentation
git checkout -b docs/developer-guide
```

### Security Best Practices

#### 1. Never Commit Secrets

```bash
# .gitignore should include:
.env
.env.local
*.key
secrets.json
```

#### 2. Use Environment Variables

```javascript
// ✅ GOOD
const privateKey = process.env.PRIVATE_KEY;

// ❌ BAD
const privateKey = "0x1234...";
```

#### 3. Verify Signatures in Decryption

```solidity
function processDecryption(
    uint256 requestId,
    uint8 value,
    bytes memory signatures
) external {
    bytes memory decryptedValues = abi.encode(value);
    FHE.checkSignatures(requestId, decryptedValues, signatures);
    // Only proceed if signatures are valid
}
```

---

## Maintenance Checklist

### Weekly

- [ ] Review and respond to issues
- [ ] Update dependencies if needed
- [ ] Run test suite
- [ ] Check for security advisories

### Monthly

- [ ] Review and update documentation
- [ ] Check for FHEVM library updates
- [ ] Review and merge community contributions
- [ ] Update examples with new patterns

### Quarterly

- [ ] Major dependency updates
- [ ] Security audit review
- [ ] Performance optimization review
- [ ] Documentation overhaul

---

## Contributing

### How to Contribute

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Update documentation
6. Submit a pull request

### Code Review Checklist

- [ ] Code follows project style guidelines
- [ ] Tests pass locally
- [ ] New features have test coverage
- [ ] Documentation is updated
- [ ] No security vulnerabilities introduced
- [ ] FHE patterns used correctly
- [ ] Commit messages are clear

---

## Resources

### Documentation

- **FHEVM Docs**: https://docs.zama.ai/fhevm
- **Zama GitHub**: https://github.com/zama-ai/fhevm
- **Hardhat Docs**: https://hardhat.org/docs
- **Ethers.js v6**: https://docs.ethers.org/v6/

### Community

- **Zama Discord**: https://discord.com/invite/zama
- **FHEVM Forum**: https://community.zama.ai/
- **Twitter**: https://twitter.com/zama_fhe

### Tools

- **Hardhat**: https://hardhat.org/
- **OpenZeppelin**: https://www.openzeppelin.com/
- **Etherscan**: https://etherscan.io/
- **Sepolia Faucet**: https://sepoliafaucet.com/

---

## Getting Help

If you encounter issues:

1. Check this developer guide
2. Review the README.md
3. Search existing GitHub issues
4. Check FHEVM documentation
5. Ask in Zama Discord
6. Create a new GitHub issue

---

**Last Updated:** December 2025
**Version:** 1.0.0
**Maintainer:** FHEVM Community

---

*This developer guide is part of the Zama December 2025 Bounty Track submission.*
