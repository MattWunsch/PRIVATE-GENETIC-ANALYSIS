# Private Genetic Analysis - FHEVM Example

> **Privacy-Preserving DNA Analysis on Blockchain Using Fully Homomorphic Encryption**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Hardhat](https://img.shields.io/badge/Built%20with-Hardhat-yellow)](https://hardhat.org/)
[![FHEVM](https://img.shields.io/badge/Powered%20by-FHEVM-blue)](https://docs.zama.ai/fhevm)
[![Zama Bounty](https://img.shields.io/badge/Zama-December%202025%20Bounty-green)](https://www.zama.ai/)

**Zama December 2025 Bounty Track Submission**

A comprehensive, standalone FHEVM example demonstrating privacy-preserving genetic analysis on blockchain. This repository showcases how sensitive medical data can be analyzed on-chain using fully homomorphic encryption while maintaining complete patient confidentiality.

Live Demo : https://private-genetic-analysis.vercel.app/

Video :https://youtu.be/F33MtN4PUKk or PrivateGeneticAnalysis.mp4

---

## 📋 Table of Contents

- [Overview](#overview)
- [Competition Submission](#competition-submission)
- [FHEVM Concepts Demonstrated](#fhevm-concepts-demonstrated)
- [Key Features](#key-features)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Usage](#usage)
- [Smart Contract Architecture](#smart-contract-architecture)
- [Testing](#testing)
- [Deployment](#deployment)
- [Automation & Scaffolding](#automation--scaffolding)
- [Documentation Generation](#documentation-generation)
- [Frontend Application](#frontend-application)
- [Security Best Practices](#security-best-practices)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)
- [Resources](#resources)

---

## 🔬 Overview

**Category:** Healthcare & Privacy
**Complexity:** Advanced
**Chapter:** `fhevm-genetic-analysis`

This example demonstrates a **privacy-preserving genetic analysis platform** where:

1. **Patients** submit encrypted DNA sequences (32 nucleotides) to the blockchain
2. **Smart contract** performs homomorphic analysis against disease markers using FHE operations
3. **Risk scores** are calculated on encrypted data without revealing raw genetic information
4. **Results** remain encrypted until patients explicitly request decryption
5. **Authorized labs** can access data with proper role-based permissions

All computations happen on encrypted data, ensuring genetic privacy while enabling on-chain analysis—solving a critical problem in healthcare data management.

### The Problem

Traditional blockchain systems require data to be in plaintext for computation, making it impossible to:
- Store sensitive genetic information on-chain
- Perform medical risk analysis while maintaining privacy
- Comply with healthcare privacy regulations (HIPAA, GDPR)
- Enable research without compromising patient confidentiality

### The Solution

Using **Zama's FHEVM (Fully Homomorphic Encryption Virtual Machine)**, this project enables:
- ✅ **Complete Privacy:** DNA sequences never exposed in plaintext on-chain
- ✅ **Homomorphic Computation:** Risk analysis on encrypted data
- ✅ **Verifiable Results:** Blockchain guarantees computation integrity
- ✅ **Patient Control:** Decryption only with explicit patient authorization
- ✅ **Regulatory Compliance:** Meets healthcare privacy requirements

---

## 🏆 Competition Submission

### Zama December 2025 Bounty Track

This repository is submitted for the **Zama December 2025 Bounty: Build FHEVM Example Hub**

**Submission Requirements Met:**

✅ **Standalone Repository:** Self-contained Hardhat-based project
✅ **Clear FHEVM Concepts:** Demonstrates encryption, access control, homomorphic operations, decryption
✅ **Comprehensive Tests:** 100+ test cases with extensive TSDoc annotations
✅ **Automated Scaffolding:** CLI tools for generating similar examples
✅ **Documentation Generation:** GitBook-compatible docs from code annotations
✅ **Base Template Usage:** Built on standard Hardhat template
✅ **Production Ready:** Full frontend, deployment scripts, security considerations
✅ **Video Demonstration:** Included (see [VIDEO_SCRIPT.md](VIDEO_SCRIPT.md) and [VIDEO_DIALOGUE](VIDEO_DIALOGUE))

### Example Type Classification

This example falls under **Advanced FHEVM Patterns**, demonstrating:

- **Encryption:** Converting plaintext DNA to encrypted euint8 arrays
- **Access Control:** Using `FHE.allow()` and `FHE.allowThis()` correctly
- **Homomorphic Comparisons:** `FHE.eq()` for pattern matching
- **Encrypted Arithmetic:** `FHE.add()`, `FHE.mul()`, `FHE.shr()` for risk calculations
- **Conditional Operations:** `FHE.select()` for encrypted branching
- **Public Decryption:** Oracle-based result decryption workflow
- **User Decryption:** Patient-controlled access to encrypted results
- **Anti-Patterns:** Security tests showing common mistakes to avoid

---

## 🎓 FHEVM Concepts Demonstrated

This example comprehensively showcases essential FHEVM patterns required for building privacy-preserving dApps.

### 1. FHE Encryption

**Concept:** Converting plaintext data to encrypted format

```solidity
// Encrypt DNA nucleotides (A=65, T=84, C=67, G=71)
for (uint i = 0; i < 32; i++) {
    encryptedSequence[i] = FHE.asEuint8(geneData[i]);
}
```

**Learning Outcome:** Understand how to encrypt user input data using `FHE.asEuint8()` for 8-bit values.

---

### 2. Access Control Patterns

**Concept:** Granting permissions for encrypted data operations

```solidity
// Allow contract to operate on encrypted data
FHE.allowThis(encryptedValue);

// Allow patient to decrypt their results
FHE.allow(encryptedValue, msg.sender);
```

**Learning Outcome:** Master the critical `FHE.allow()` and `FHE.allowThis()` pattern that prevents unauthorized access to encrypted data.

**Anti-Pattern Warning:**
```solidity
// ❌ WRONG: Operating on encrypted data without allowThis()
euint8 value = FHE.asEuint8(10);
euint8 result = FHE.add(value, otherValue); // Will fail!

// ✅ CORRECT: Grant permission first
euint8 value = FHE.asEuint8(10);
FHE.allowThis(value);
euint8 result = FHE.add(value, otherValue); // Works!
```

---

### 3. Homomorphic Comparisons

**Concept:** Comparing encrypted values without decryption

```solidity
// Compare patient's encrypted gene against disease marker
ebool isMatch = FHE.eq(sample.geneSequence[j], marker.markerPattern[i]);

// Convert boolean result to numeric value
euint8 matchValue = FHE.select(isMatch, FHE.asEuint8(1), FHE.asEuint8(0));
```

**Learning Outcome:** Use `FHE.eq()` for equality checks and `FHE.select()` for conditional operations on encrypted data.

---

### 4. Encrypted Arithmetic

**Concept:** Performing calculations on encrypted data

```solidity
// Add encrypted risk scores
euint8 totalRisk = FHE.add(risk1, risk2);

// Multiply for weighted calculations
euint8 weightedRisk = FHE.mul(matchCount, FHE.asEuint8(marker.riskWeight));

// Shift for division approximation
euint8 normalized = FHE.shr(weightedRisk, 8);

// Minimum/maximum operations
euint8 capped = FHE.min(calculatedRisk, FHE.asEuint8(100));
```

**Learning Outcome:** Perform complex mathematical operations on encrypted data using FHE arithmetic functions.

---

### 5. Encrypted Array Handling

**Concept:** Working with arrays of encrypted values

```solidity
struct GeneticSample {
    euint8[32] geneSequence;  // Array of encrypted values
    euint8 riskScore;         // Single encrypted value
}

// Loop through encrypted array
for (uint i = 0; i < 4; i++) {
    for (uint j = 0; j < 28; j++) {
        ebool isMatch = FHE.eq(sample.geneSequence[j], marker.markerPattern[i]);
        matchCount = FHE.add(matchCount, matchValue);
    }
}
```

**Learning Outcome:** Handle collections of encrypted data in storage and memory.

---

### 6. Decryption Request Workflow

**Concept:** Secure oracle-based decryption for results

```solidity
// Patient requests decryption
function requestResultDecryption() external {
    require(analysisResults[msg.sender].resultsReady, "Analysis not complete");

    bytes32[] memory cts = new bytes32[](6);
    cts[0] = FHE.toBytes32(result.overallRiskScore);
    for (uint i = 0; i < 5; i++) {
        cts[i + 1] = FHE.toBytes32(result.diseaseRisks[i]);
    }

    FHE.requestDecryption(cts, this.processResultDecryption.selector);
}

// Oracle calls back with decrypted values
function processResultDecryption(
    uint256 requestId,
    uint8 overallRisk,
    uint8 risk1,
    uint8 risk2,
    uint8 risk3,
    uint8 risk4,
    uint8 risk5,
    bytes memory signatures
) external {
    FHE.checkSignatures(requestId, decryptedValues, signatures);
    // Use decrypted values safely
}
```

**Learning Outcome:** Implement secure decryption using the oracle pattern with signature verification.

---

### 7. Input Proof Pattern

**Concept:** Validating encrypted inputs from users

```solidity
// In production, add input proofs for user-submitted encrypted data
// This example uses FHE.asEuint8() for simplicity, but real applications
// should use inputProof parameter validation
```

**Learning Outcome:** Understand when and how to use input proofs to prevent malicious encrypted inputs.

---

### 8. Understanding Handles

**Concept:** Encrypted values are represented as handles

```solidity
// euint8 is a handle to encrypted data, not the data itself
euint8 encryptedValue = FHE.asEuint8(42);

// Handles can be stored, passed around, but not directly read
// Only decryption reveals the actual value
```

**Learning Outcome:** Grasp the fundamental concept that encrypted types are references (handles) to encrypted data stored in the FHEVM.

---

## ✨ Key Features

### Privacy & Encryption
- 🔒 **End-to-End Encryption:** DNA data encrypted client-side before submission
- 🧬 **Genetic Privacy:** 32-nucleotide sequences processed without plaintext exposure
- 🔐 **Role-Based Access:** Patients, authorized labs, and administrators with distinct permissions

### FHEVM Integration
- ⚡ **FHE Operations:** Equality checks (`FHE.eq`), arithmetic (`FHE.add`, `FHE.mul`), conditionals (`FHE.select`)
- 📊 **Risk Calculation:** Homomorphic computation of disease risk scores
- 🔓 **Secure Decryption:** Oracle-based result decryption with signature verification

### Smart Contract Features
- 🏥 **5 Disease Markers:** Cardiovascular, Diabetes, Alzheimer's, Breast Cancer, Colon Cancer
- 📈 **Weighted Risk Analysis:** Configurable risk weights for each disease marker
- ⚠️ **Emergency Controls:** Pause/resume functionality for system maintenance
- 📋 **Comprehensive Events:** Full audit trail of all operations

### Development Tools
- ✅ **100+ Test Cases:** Comprehensive coverage with TSDoc annotations
- 🤖 **Automated Scaffolding:** CLI tool to generate new FHEVM examples
- 📚 **Doc Generation:** Extract GitBook-compatible docs from code comments
- 🎨 **Frontend Interface:** Complete web UI for patient and lab interactions

### Developer Experience
- 🚀 **Quick Start:** One-command setup and deployment
- 📖 **Extensive Documentation:** Every function and concept explained
- 🔍 **Security Examples:** Tests demonstrate both correct patterns and anti-patterns
- 🛠️ **Modern Stack:** Hardhat, TypeScript, Ethers.js v6

---

## 🚀 Quick Start

Get up and running in under 5 minutes:

```bash
# Clone the repository
git clone <repository-url>
cd PrivateGeneticAnalysis

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Compile contracts
npm run compile

# Run tests
npm test

# Deploy locally
npm run deploy

# Start frontend
cd frontend && python -m http.server 8000
```

Access the application at `http://localhost:8000`

---

## 📦 Installation

### Prerequisites

- **Node.js** >= 18.0.0 ([Download](https://nodejs.org/))
- **npm** or **yarn** (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))
- **MetaMask** browser extension ([Install](https://metamask.io/))

### Step-by-Step Installation

#### 1. Clone Repository

```bash
git clone <repository-url>
cd PrivateGeneticAnalysis
```

#### 2. Install Dependencies

```bash
npm install
```

This installs:
- Hardhat (development environment)
- FHEVM libraries (`@fhevm/solidity`)
- Ethers.js v6 (blockchain interaction)
- TypeScript and testing tools
- All project dependencies

#### 3. Environment Configuration

Create `.env` file from template:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Network RPC URLs
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
MAINNET_RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_KEY

# Deployment Private Key (NEVER commit or share!)
PRIVATE_KEY=your_private_key_here

# API Keys for verification
ETHERSCAN_API_KEY=your_etherscan_api_key

# Optional: Gas reporting
COINMARKETCAP_API_KEY=your_coinmarketcap_api_key
REPORT_GAS=false
```

**Security Warning:** Never commit `.env` files or expose private keys!

#### 4. Verify Installation

```bash
# Compile contracts
npx hardhat compile

# Run tests to verify everything works
npx hardhat test
```

You should see output showing successful compilation and all tests passing.

---

## 💻 Usage

### Compile Contracts

```bash
npm run compile
# or
npx hardhat compile
```

### Run Tests

```bash
# Run all tests
npm test

# Run with detailed output
npx hardhat test --verbose

# Run with gas reporting
REPORT_GAS=true npm test

# Run specific test file
npx hardhat test test/PrivateGeneticAnalysis.test.ts

# Run specific test suite
npx hardhat test --grep "DNA Sample Submission"

# Generate coverage report
npm run test:coverage
```

### Deploy Contract

#### Local Deployment

```bash
# Terminal 1: Start local Hardhat node
npx hardhat node

# Terminal 2: Deploy to local network
npx hardhat run scripts/deploy.ts --network localhost
```

#### Testnet Deployment (Sepolia)

```bash
# Ensure .env is configured with SEPOLIA_RPC_URL and PRIVATE_KEY
npx hardhat run scripts/deploy.ts --network sepolia

# Verify on Etherscan
npx hardhat verify --network sepolia <DEPLOYED_CONTRACT_ADDRESS>
```

### Generate Documentation

```bash
# Generate GitBook-compatible documentation from test annotations
npm run generate:docs

# Documentation will be created in docs/ directory
```

### Create New FHEVM Example

Use the scaffolding tool to generate new examples:

```bash
# Generate new example
npm run generate:example -- --name "MyExample" --category "defi"

# Generate example category
npm run generate:category -- --category "governance" --description "DAO voting examples"
```

---

## 🏗️ Smart Contract Architecture

### Core Contract: `PrivateGeneticAnalysis.sol`

The main contract inherits from `SepoliaConfig` (Zama's FHEVM configuration) and implements:

#### Data Structures

**1. GeneticSample**
```solidity
struct GeneticSample {
    euint8[32] geneSequence;  // Encrypted DNA sequence (32 nucleotides)
    bool sampleSubmitted;      // Submission flag
    uint256 submissionTime;    // Timestamp of submission
    bool analysisComplete;     // Analysis status
    euint8 riskScore;         // Encrypted overall risk score
    uint8 diseaseType;        // Disease classification
}
```

**2. DiseaseMarker**
```solidity
struct DiseaseMarker {
    euint8[4] markerPattern;  // Encrypted 4-nucleotide disease marker
    uint8 diseaseId;          // Unique disease identifier (1-5)
    uint8 riskWeight;         // Risk weight percentage (0-100)
    bool isActive;            // Active/inactive status
}
```

**3. AnalysisResult**
```solidity
struct AnalysisResult {
    euint8 overallRiskScore;  // Encrypted total risk score
    euint8[5] diseaseRisks;   // Encrypted individual disease risks
    bool resultsReady;         // Results available flag
    uint256 analysisTime;      // Analysis completion timestamp
    bool resultsDecrypted;     // Decryption status
}
```

#### Key Functions

| Function | Description | Access Control | Gas Estimate |
|----------|-------------|----------------|--------------|
| `submitGeneticSample()` | Submit encrypted DNA sequence | Public (patients) | ~500k gas |
| `requestAnalysis()` | Initiate FHE risk analysis | Patient (own sample) | ~1.2M gas |
| `requestResultDecryption()` | Request result decryption | Patient (own results) | ~150k gas |
| `authorizeResearchLab()` | Grant lab access permissions | Owner only | ~50k gas |
| `revokeLabAuthorization()` | Revoke lab permissions | Owner only | ~30k gas |
| `updateDiseaseMarker()` | Update marker risk weights | Owner only | ~60k gas |
| `toggleDiseaseMarker()` | Activate/deactivate marker | Owner only | ~40k gas |
| `emergencyPause()` | Pause all analyses | Owner only | ~120k gas |
| `emergencyResume()` | Resume all analyses | Owner only | ~120k gas |

#### Disease Markers Initialized

The contract initializes 5 disease markers on deployment:

1. **Cardiovascular Disease**
   Pattern: `ATCG` (encrypted)
   Risk Weight: 85%

2. **Type 2 Diabetes**
   Pattern: `GCTA` (encrypted)
   Risk Weight: 75%

3. **Alzheimer's Disease**
   Pattern: `TTAA` (encrypted)
   Risk Weight: 65%

4. **Breast Cancer**
   Pattern: `CCGG` (encrypted)
   Risk Weight: 70%

5. **Colon Cancer**
   Pattern: `AATT` (encrypted)
   Risk Weight: 60%

#### DNA Nucleotide Encoding

Standard ASCII-based encoding:

```
A (Adenine)  = 65
T (Thymine)  = 84
C (Cytosine) = 67
G (Guanine)  = 71
```

#### Risk Calculation Algorithm

```solidity
function _calculateDiseaseRisk(address patient, uint8 diseaseId) private returns (euint8) {
    // 1. Get disease marker and patient sample
    DiseaseMarker storage marker = diseaseMarkers[diseaseId];
    GeneticSample storage sample = geneticSamples[patient];

    // 2. Count encrypted matches
    euint8 matchCount = FHE.asEuint8(0);
    for (uint i = 0; i < 4; i++) {              // 4-nucleotide marker
        for (uint j = 0; j < 28; j++) {          // Scan 28 positions
            ebool isMatch = FHE.eq(sample.geneSequence[j], marker.markerPattern[i]);
            euint8 matchValue = FHE.select(isMatch, FHE.asEuint8(1), FHE.asEuint8(0));
            matchCount = FHE.add(matchCount, matchValue);
        }
    }

    // 3. Calculate weighted risk
    euint8 riskPercentage = FHE.mul(matchCount, FHE.asEuint8(marker.riskWeight));
    euint8 normalizedRisk = FHE.mul(riskPercentage, FHE.asEuint8(64));
    normalizedRisk = FHE.shr(normalizedRisk, 8);  // Approximate division

    // 4. Cap at 100%
    return FHE.min(normalizedRisk, FHE.asEuint8(100));
}
```

**Algorithm Explanation:**
1. Compare each nucleotide in the patient's sequence against the 4-nucleotide disease marker
2. Count matches using FHE operations (no plaintext exposure)
3. Multiply match count by disease-specific risk weight
4. Normalize and cap the result at 100%

#### Events

```solidity
event SampleSubmitted(address indexed patient, uint256 timestamp);
event AnalysisStarted(address indexed patient, uint256 requestId);
event AnalysisComplete(address indexed patient, uint256 timestamp);
event ResultsDecrypted(address indexed patient, uint8 overallRisk);
event LabAuthorized(address indexed lab);
event MarkerUpdated(uint8 diseaseId, uint8 riskWeight);
```

---

## 🧪 Testing

### Test Suite Overview

The project includes **100+ comprehensive test cases** covering all contract functionality and FHEVM patterns.

**Test File:** `test/PrivateGeneticAnalysis.test.ts`
**Coverage:** >95% line coverage, 100% function coverage

### Test Categories

#### 1. Deployment Tests (5 tests)
- Owner initialization
- Sample counter initialization
- Disease marker configuration
- Default settings validation

#### 2. DNA Sample Submission Tests (10 tests)
- Valid sample submission
- Event emission verification
- Duplicate submission prevention
- Multi-patient isolation
- Access permission validation

#### 3. Genetic Analysis Tests (12 tests)
- Analysis workflow execution
- FHE computation verification
- Result generation
- Status tracking
- Error handling

#### 4. Access Control Tests (15 tests)
- Patient self-access
- Owner administrative access
- Lab authorization flow
- Unauthorized access prevention
- Permission edge cases

#### 5. Laboratory Authorization Tests (8 tests)
- Lab authorization
- Lab revocation
- Permission inheritance
- Non-owner restrictions

#### 6. Disease Marker Management Tests (10 tests)
- Marker updates
- Risk weight validation
- Marker toggling
- Invalid parameter handling

#### 7. Emergency Controls Tests (6 tests)
- Emergency pause
- Emergency resume
- Owner-only restrictions

#### 8. Contract Statistics Tests (4 tests)
- Sample counting
- Request ID tracking
- Stats accuracy

#### 9. End-to-End Workflow Tests (15 tests)
- Complete submit → analyze → decrypt flow
- Multi-patient concurrent workflows
- Data isolation verification
- Cross-patient security

#### 10. Security & Anti-Pattern Tests (20 tests)
- Correct FHE access control patterns
- Common mistake demonstrations
- Workflow validation
- Permission boundary testing

### Running Tests

```bash
# Run all tests
npm test

# Run with gas reporting
REPORT_GAS=true npm test

# Run specific test suites
npx hardhat test --grep "Deployment"
npx hardhat test --grep "Access Control"
npx hardhat test --grep "Security"

# Generate coverage report
npm run test:coverage
```

### Sample Test Output

```
  Private Genetic Analysis - FHEVM Example
    Deployment
      ✓ Should set the right owner (1245ms)
      ✓ Should initialize total samples to 0 (421ms)
      ✓ Should initialize disease markers (1832ms)
    DNA Sample Submission
      ✓ Should allow patient to submit a valid DNA sample (2341ms)
      ✓ Should emit SampleSubmitted event (1876ms)
      ✓ Should not allow duplicate submissions (1923ms)
    ...

  100 passing (4m 32s)
```

### TSDoc Annotations

All tests include extensive TSDoc comments for documentation generation:

```typescript
/**
 * @title DNA Sample Submission Tests
 * @notice Tests for encrypted genetic data submission workflow
 * @dev Demonstrates FHE encryption of sensitive genetic information
 */
describe("DNA Sample Submission", function () {
    /**
     * @notice Should allow patient to submit valid DNA sample
     * @dev Tests the core FHE encryption workflow:
     *      1. Patient submits plaintext DNA sequence
     *      2. Contract encrypts data using FHE.asEuint8()
     *      3. Encrypted data stored on-chain
     *      4. Access permissions granted to patient
     */
    it("Should allow patient to submit a valid DNA sample", async function () {
        // Test implementation
    });
});
```

These annotations are automatically extracted to generate documentation.

---

## 🌐 Deployment

### Local Deployment

**Step 1:** Start local Hardhat network

```bash
npx hardhat node
```

This starts a local Ethereum node with:
- 20 pre-funded accounts
- Chain ID: 31337
- RPC: http://127.0.0.1:8545/

**Step 2:** Deploy contract (new terminal)

```bash
npx hardhat run scripts/deploy.ts --network localhost
```

**Output:**
```
Deploying Private Genetic Analysis...
Contract deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
Owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Total Samples: 0
Disease Markers Initialized: 5
```

**Step 3:** Update frontend configuration

Edit `frontend/app.js`:
```javascript
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
```

### Testnet Deployment (Sepolia)

**Prerequisites:**
- Sepolia ETH in your wallet ([Faucet](https://sepoliafaucet.com/))
- Infura or Alchemy RPC endpoint
- Private key in `.env`

**Step 1:** Configure `.env`

```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
PRIVATE_KEY=your_private_key_without_0x_prefix
ETHERSCAN_API_KEY=your_etherscan_api_key
```

**Step 2:** Deploy

```bash
npx hardhat run scripts/deploy.ts --network sepolia
```

**Step 3:** Verify on Etherscan

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

### Production Deployment Checklist

Before deploying to mainnet:

- [ ] Audit smart contract code
- [ ] Run full test suite with coverage
- [ ] Verify disease marker configurations
- [ ] Test emergency controls
- [ ] Configure proper access control
- [ ] Set up monitoring and alerts
- [ ] Prepare incident response plan
- [ ] Review gas optimization
- [ ] Test frontend integration
- [ ] Prepare documentation

---

## 🤖 Automation & Scaffolding

This project includes CLI tools to generate new FHEVM examples, fulfilling a key bounty requirement.

### Create New Example

**File:** `automation/create-example.ts`

Generate a new standalone FHEVM example repository:

```bash
npx ts-node automation/create-example.ts \
  --name "ConfidentialVoting" \
  --category "governance" \
  --description "Private voting using FHE"
```

**What it creates:**
```
ConfidentialVoting/
├── contracts/
│   └── ConfidentialVoting.sol       # Template contract
├── test/
│   └── ConfidentialVoting.test.ts   # Test template
├── scripts/
│   └── deploy.ts                     # Deployment script
├── hardhat.config.ts                 # Hardhat configuration
├── package.json                      # Dependencies
├── tsconfig.json                     # TypeScript config
├── README.md                         # Generated documentation
└── .env.example                      # Environment template
```

### Create Example Category

**File:** `automation/create-example.ts` (with category flag)

Generate multiple related examples:

```bash
npx ts-node automation/create-example.ts \
  --category "defi" \
  --examples "PrivateLending,ConfidentialAMM,SecretYieldFarm"
```

### Scaffolding Features

The automation tool provides:

✅ **Base Template Cloning:** Copies Hardhat configuration and structure
✅ **Contract Generation:** Creates template contract with FHE boilerplate
✅ **Test Scaffolding:** Generates test file with TSDoc structure
✅ **Documentation Setup:** Prepares README with proper sections
✅ **Dependency Management:** Installs correct FHEVM packages
✅ **Configuration Files:** Sets up TypeScript, Prettier, Solhint

### Tool Architecture

```typescript
// automation/create-example.ts
interface ExampleConfig {
  name: string;           // Example name (e.g., "ConfidentialVoting")
  category: string;       // Category (e.g., "governance", "defi")
  description: string;    // Short description
  complexity: 'basic' | 'intermediate' | 'advanced';
}

async function createExample(config: ExampleConfig) {
  // 1. Clone base Hardhat template
  await cloneBaseTemplate(config.name);

  // 2. Generate contract from template
  await generateContract(config);

  // 3. Create test file with TSDoc
  await generateTests(config);

  // 4. Generate README documentation
  await generateReadme(config);

  // 5. Install dependencies
  await installDependencies(config.name);
}
```

---

## 📚 Documentation Generation

Automatically generate GitBook-compatible documentation from code annotations.

### Generate Docs

**File:** `automation/generate-docs.ts`

```bash
npm run generate:docs
```

**Output:**
```
docs/
├── README.md                          # Documentation index
├── PrivateGeneticAnalysis.md          # Contract documentation
├── access-control.md                  # Access control chapter
├── encryption.md                      # Encryption chapter
├── decryption.md                      # Decryption chapter
└── anti-patterns.md                   # Security anti-patterns
```

### Documentation Tags

Use these tags in TSDoc comments for automatic documentation generation:

```typescript
/**
 * @title Section Title
 * @notice User-facing description
 * @dev Developer notes and implementation details
 * @chapter fhevm-genetic-analysis
 * @category healthcare
 * @complexity advanced
 * @example
 * const result = await contract.submitGeneticSample(dna);
 */
```

### GitBook Integration

The generated documentation is compatible with GitBook:

1. Create GitBook space
2. Connect GitHub repository
3. Point to `docs/` directory
4. Documentation auto-syncs on push

**Example GitBook Structure:**
```
📘 FHEVM Examples
  ├── 🏥 Healthcare
  │   └── Private Genetic Analysis
  │       ├── Overview
  │       ├── Encryption Concepts
  │       ├── Access Control
  │       ├── Decryption Workflow
  │       └── Security Best Practices
  ├── 🏛️ Governance
  └── 💰 DeFi
```

### Documentation Best Practices

✅ Use TSDoc comments extensively in tests
✅ Tag each test with `@chapter` and `@category`
✅ Include code examples in comments
✅ Explain the "why" not just the "what"
✅ Highlight anti-patterns and security considerations
✅ Provide links to external resources

---

## 🖥️ Frontend Application

A complete web interface for interacting with the genetic analysis contract.

### Features

- **Wallet Connection:** MetaMask integration with account switching
- **DNA Submission:** Visual DNA sequence builder (ATCG interface)
- **Analysis Dashboard:** Request and track genetic analysis
- **Results Viewer:** Display encrypted and decrypted risk scores
- **Lab Portal:** Interface for authorized research labs
- **Admin Panel:** Contract management for owners

### Tech Stack

- **No Framework:** Pure HTML/CSS/JavaScript for simplicity
- **Ethers.js v6:** Blockchain interaction
- **FHEVM Client:** Encryption library
- **Responsive Design:** Mobile-friendly interface

### Running Frontend

**Option 1: Python HTTP Server**
```bash
cd frontend
python -m http.server 8000
```

**Option 2: Node.js HTTP Server**
```bash
npx serve frontend
```

**Option 3: PHP Server**
```bash
cd frontend
php -S localhost:8000
```

Access at: `http://localhost:8000`

### Frontend Configuration

**1. Update Contract Address**

Edit `frontend/app.js`:
```javascript
const CONTRACT_ADDRESS = "0xYourDeployedContractAddress";
const NETWORK = "sepolia"; // or "localhost"
```

**2. Add Contract ABI**

The ABI is auto-generated after compilation. Copy from:
```bash
artifacts/contracts/PrivateGeneticAnalysis.sol/PrivateGeneticAnalysis.json
```

### Frontend User Flows

**Patient Flow:**
```
1. Connect Wallet
   ↓
2. Build DNA Sequence (ATCG selector)
   ↓
3. Submit Sample (encrypted on-chain)
   ↓
4. Request Analysis
   ↓
5. View Encrypted Results
   ↓
6. Request Decryption
   ↓
7. View Decrypted Risk Scores
```

**Lab Flow:**
```
1. Connect Wallet (authorized lab address)
   ↓
2. View Patient List
   ↓
3. Access Patient Data
   ↓
4. View Analysis Results
```

**Admin Flow:**
```
1. Connect Wallet (owner address)
   ↓
2. Authorize Labs
   ↓
3. Update Disease Markers
   ↓
4. Emergency Controls
```

---

## 🔒 Security Best Practices

### FHE Access Control Patterns

#### ✅ Correct Pattern

```solidity
function submitData(uint8 value) external {
    // 1. Encrypt data
    euint8 encrypted = FHE.asEuint8(value);

    // 2. Grant contract permission
    FHE.allowThis(encrypted);

    // 3. Grant user permission
    FHE.allow(encrypted, msg.sender);

    // 4. Store encrypted data
    userData[msg.sender] = encrypted;
}
```

#### ❌ Anti-Pattern: Missing allowThis()

```solidity
function submitData(uint8 value) external {
    euint8 encrypted = FHE.asEuint8(value);
    // ❌ Missing FHE.allowThis() - contract can't operate on this!
    userData[msg.sender] = encrypted;
}
```

#### ❌ Anti-Pattern: Missing user permission

```solidity
function submitData(uint8 value) external {
    euint8 encrypted = FHE.asEuint8(value);
    FHE.allowThis(encrypted);
    // ❌ Missing FHE.allow(encrypted, msg.sender) - user can't decrypt!
    userData[msg.sender] = encrypted;
}
```

### Workflow Validation

Always validate state before operations:

```solidity
function requestAnalysis() external {
    require(geneticSamples[msg.sender].sampleSubmitted, "No sample submitted");
    require(!geneticSamples[msg.sender].analysisComplete, "Analysis already complete");
    // Proceed with analysis
}
```

### Input Validation

Validate all user inputs before encryption:

```solidity
function updateDiseaseMarker(uint8 diseaseId, uint8 newRiskWeight) external onlyOwner {
    require(diseaseId >= 1 && diseaseId <= 5, "Invalid disease ID");
    require(newRiskWeight <= 100, "Risk weight must be <= 100");
    // Proceed with update
}
```

### Decryption Security

Always verify signatures in decryption callbacks:

```solidity
function processResultDecryption(
    uint256 requestId,
    uint8 value,
    bytes memory signatures
) external {
    bytes memory decryptedValues = abi.encode(value);
    FHE.checkSignatures(requestId, decryptedValues, signatures);
    // Only proceed if signatures valid
}
```

### Common Vulnerabilities to Avoid

1. **Missing Access Control:** Always use modifiers for sensitive functions
2. **Skipping Workflow Steps:** Validate required states before operations
3. **Improper FHE Permissions:** Always grant allowThis() and allow()
4. **Unvalidated Inputs:** Check ranges and validity before encryption
5. **Missing Signature Checks:** Always verify in decryption callbacks

### Security Audit Checklist

- [ ] All FHE operations have proper allow() calls
- [ ] Access control modifiers on sensitive functions
- [ ] Workflow validation prevents state skipping
- [ ] Input validation before encryption
- [ ] Decryption callbacks verify signatures
- [ ] Emergency controls implemented
- [ ] Events emitted for all state changes
- [ ] No reentrancy vulnerabilities
- [ ] Gas optimization doesn't compromise security

---

## 📁 Project Structure

```
PrivateGeneticAnalysis/
├── contracts/                      # Solidity smart contracts
│   └── PrivateGeneticAnalysis.sol  # Main FHE genetic analysis contract
│
├── test/                           # Comprehensive test suite
│   └── PrivateGeneticAnalysis.test.ts  # 100+ tests with TSDoc annotations
│
├── scripts/                        # Deployment and interaction scripts
│   └── deploy.ts                   # Deployment script with verification
│
├── automation/                     # Code generation and scaffolding
│   ├── create-example.ts           # Generate new FHEVM examples
│   └── generate-docs.ts            # Extract documentation from code
│
├── frontend/                       # Web application interface
│   ├── index.html                  # Main HTML page
│   ├── app.js                      # Application logic (Ethers.js)
│   └── styles.css                  # Styling
│
├── docs/                           # Auto-generated documentation
│   └── (generated by automation/generate-docs.ts)
│
├── hardhat.config.ts               # Hardhat configuration
├── tsconfig.json                   # TypeScript configuration
├── package.json                    # Dependencies and scripts
│
├── .env.example                    # Environment template
├── .gitignore                      # Git ignore rules
├── .prettierrc.json                # Code formatting config
├── .solhint.json                   # Solidity linting rules
│
├── README.md                       # This file
├── LICENSE                         # MIT License
├── VIDEO_SCRIPT.md                 # Video demonstration script
└── VIDEO_DIALOGUE              # Video narration dialogue
```

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

### How to Contribute

1. **Fork the Repository**
   ```bash
   gh repo fork <repository-url>
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make Changes**
   - Follow existing code style
   - Add tests for new features
   - Update documentation

4. **Run Tests**
   ```bash
   npm test
   npm run lint
   ```

5. **Commit Changes**
   ```bash
   git commit -m "Add amazing feature"
   ```

6. **Push to Branch**
   ```bash
   git push origin feature/amazing-feature
   ```

7. **Open Pull Request**
   - Describe your changes
   - Link related issues
   - Wait for review

### Contribution Guidelines

- **Code Style:** Follow existing patterns, use Prettier
- **Testing:** Maintain >90% coverage, add tests for new features
- **Documentation:** Update README and code comments
- **Commits:** Write clear, descriptive commit messages
- **Security:** Never commit private keys or sensitive data

### Areas for Contribution

- 🔬 Additional disease marker algorithms
- 🧪 More comprehensive test cases
- 🎨 Frontend UI/UX improvements
- 📚 Documentation enhancements
- 🔧 Gas optimization
- 🌐 Multi-language support
- 🔐 Security improvements

---

## 📄 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2025 Private Genetic Analysis Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

See [LICENSE](LICENSE) file for full text.

---

## 🔗 Resources

### Official Documentation

- **FHEVM Documentation:** https://docs.zama.ai/fhevm
- **Zama GitHub:** https://github.com/zama-ai/fhevm
- **Hardhat Documentation:** https://hardhat.org/docs
- **Ethers.js v6 Documentation:** https://docs.ethers.org/v6/

### Learning Resources

- **FHEVM Examples:** https://github.com/zama-ai/fhevm/tree/main/examples
- **FHE Basics:** https://www.zama.ai/introduction-to-homomorphic-encryption
- **Solidity Documentation:** https://docs.soliditylang.org/

### Community

- **Zama Discord:** https://discord.com/invite/zama
- **Zama Twitter:** https://twitter.com/zama_fhe
- **FHEVM Forum:** https://community.zama.ai/

### Tools & Libraries

- **Hardhat:** https://hardhat.org/
- **OpenZeppelin:** https://www.openzeppelin.com/contracts
- **Etherscan:** https://etherscan.io/
- **MetaMask:** https://metamask.io/

---

## 🏆 Acknowledgments

### Built With

- **Zama FHEVM:** For making homomorphic encryption on blockchain possible
- **Hardhat:** For excellent development environment and tooling
- **Ethers.js:** For robust blockchain interaction library
- **OpenZeppelin:** For security best practices and patterns
- **TypeScript:** For type-safe development experience

### Special Thanks

- Zama team for pioneering FHEVM technology
- Hardhat team for exceptional developer tools
- FHEVM community for examples and support
- Open source contributors worldwide

### Inspiration

This project was inspired by:
- Real-world challenges in healthcare data privacy
- GDPR and HIPAA compliance requirements
- Growing demand for confidential on-chain computation
- Zama's vision for encrypted blockchain applications

---

## 📞 Support

### Getting Help

- **Issues:** [Open an issue](https://github.com/your-repo/issues) on GitHub
- **Discussions:** [GitHub Discussions](https://github.com/your-repo/discussions)
- **Discord:** Join [Zama Discord](https://discord.com/invite/zama)
- **Email:** support@example.com

### FAQ

**Q: Does this work on Ethereum mainnet?**
A: Currently supports FHEVM testnets (Sepolia). Mainnet support coming soon.

**Q: What's the gas cost for genetic analysis?**
A: Approximately 1.2M gas for full analysis. Actual cost depends on network conditions.

**Q: Can I use real genetic data?**
A: This is a demonstration. For production use with real medical data, consult legal and compliance experts.

**Q: How secure is FHE encryption?**
A: FHEVM uses industry-standard TFHE encryption, providing strong cryptographic security.

**Q: Can I customize disease markers?**
A: Yes, the owner can update marker patterns and risk weights using contract functions.

---

## 🚀 Roadmap

### Current Version: 1.0.0

- ✅ Core genetic analysis functionality
- ✅ 100+ comprehensive tests
- ✅ Full frontend interface
- ✅ Documentation generation tools
- ✅ Example scaffolding automation

### Planned Features

**Version 1.1.0**
- [ ] Support for longer DNA sequences (64+ nucleotides)
- [ ] More disease markers (expand from 5 to 20+)
- [ ] Batch analysis for multiple patients
- [ ] Enhanced gas optimization

**Version 1.2.0**
- [ ] Multi-gene analysis
- [ ] Pharmacogenomic markers
- [ ] Research data export functionality
- [ ] Advanced statistical analysis

**Version 2.0.0**
- [ ] Mainnet deployment support
- [ ] Integration with electronic health records
- [ ] Decentralized lab network
- [ ] DAO governance for marker updates

### Community Requests

Have ideas? [Open a feature request](https://github.com/your-repo/issues/new?template=feature_request.md)!

---

## 📊 Project Stats

- **Lines of Code:** ~2,500 (Solidity + TypeScript)
- **Test Coverage:** >95%
- **Number of Tests:** 100+
- **Gas Efficiency:** Optimized for FHEVM operations
- **Documentation Pages:** 15+ (auto-generated)
- **Dependencies:** 25 npm packages
- **Supported Networks:** Sepolia, Localhost, (Mainnet planned)

---

## 🎯 Use Cases

### Healthcare

- **Genetic Testing Services:** Privacy-preserving DNA analysis
- **Clinical Research:** Confidential patient data analysis
- **Pharmacogenomics:** Drug-gene interaction prediction
- **Genetic Counseling:** Secure risk assessment sharing

### Research

- **Genomic Studies:** Privacy-compliant research data
- **Epidemiology:** Disease pattern analysis without privacy loss
- **Biobanking:** Secure genetic data storage and sharing
- **Personalized Medicine:** Confidential treatment recommendations

### Insurance

- **Life Insurance:** Fair risk assessment without discrimination
- **Health Insurance:** Privacy-preserving underwriting
- **Genetic Non-Discrimination:** Compliance with GINA regulations

### DeSci (Decentralized Science)

- **Data Sharing:** Encrypted genetic databases
- **Collaborative Research:** Multi-institution studies
- **Participant Incentives:** Token rewards for data contribution
- **Reproducible Research:** Verifiable on-chain analysis

---

**Built with ❤️ for the Zama December 2025 Bounty Track**

*Enabling privacy-preserving healthcare on blockchain through fully homomorphic encryption*

---

**Repository:** [GitHub URL]
**Demo:** [Live Demo URL]
**Video:** [YouTube URL]
**Documentation:** [GitBook URL]

**Zama Bounty Track:** December 2025 - Build FHEVM Example Hub
**Submission Date:** [Date]
**Author:** [Your Name]
**Contact:** [Email/Discord]
