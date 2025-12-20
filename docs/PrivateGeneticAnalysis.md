# Private Genetic Analysis - FHEVM Example

**Category:** Healthcare & Privacy
**Complexity:** Advanced
**Chapter:** fhevm-genetic-analysis

## Overview

This example demonstrates a **privacy-preserving genetic analysis platform** using Zama's Fully Homomorphic Encryption (FHEVM). It showcases how sensitive medical data can be analyzed on-chain while maintaining complete patient confidentiality.

### The Challenge

Traditional blockchain systems require data to be in plaintext for computation, making it impossible to:
- Store sensitive genetic information on-chain
- Perform medical risk analysis while maintaining privacy
- Comply with healthcare privacy regulations (HIPAA, GDPR)
- Enable research without compromising patient confidentiality

### The Solution

Using **FHEVM (Fully Homomorphic Encryption Virtual Machine)**, this example enables:
- ✅ **Complete Privacy:** DNA sequences never exposed in plaintext on-chain
- ✅ **Homomorphic Computation:** Risk analysis on encrypted data
- ✅ **Verifiable Results:** Blockchain guarantees computation integrity
- ✅ **Patient Control:** Decryption only with explicit patient authorization
- ✅ **Regulatory Compliance:** Meets healthcare privacy requirements

---

## Key Concepts Demonstrated

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

## Test Coverage

### Deployment Tests
- ✓ Contract owner initialization
- ✓ Total samples counter initialization
- ✓ Disease marker configuration

### DNA Sample Submission Tests
- ✓ Valid sample submission
- ✓ SampleSubmitted event emission
- ✓ Duplicate submission prevention
- ✓ Multi-patient data isolation

### Genetic Analysis Tests
- ✓ Analysis request workflow
- ✓ FHE computation verification
- ✓ Result generation
- ✓ Status tracking

### Access Control Tests
- ✓ Patient self-access
- ✓ Owner administrative access
- ✓ Unauthorized access prevention
- ✓ Permission edge cases

### Laboratory Authorization Tests
- ✓ Lab authorization workflow
- ✓ Lab revocation
- ✓ Permission inheritance

### Disease Marker Management Tests
- ✓ Marker updates
- ✓ Risk weight validation
- ✓ Marker toggling
- ✓ Invalid parameter handling

### Emergency Controls Tests
- ✓ Emergency pause
- ✓ Emergency resume
- ✓ Owner-only restrictions

### End-to-End Workflow Tests
- ✓ Complete submit → analyze → decrypt flow
- ✓ Multi-patient concurrent workflows
- ✓ Data isolation verification

### Security & Anti-Pattern Tests
- ✓ Correct FHE access control patterns
- ✓ Common mistake demonstrations
- ✓ Workflow validation

---

## Usage

### Running Tests

```bash
# Run all tests
npx hardhat test

# Run specific test file
npx hardhat test test/PrivateGeneticAnalysis.test.ts

# Run specific test suite
npx hardhat test --grep "DNA Sample Submission"

# Run with gas reporting
REPORT_GAS=true npx hardhat test

# Generate coverage report
npm run test:coverage
```

### Compiling Contracts

```bash
npm run compile
```

### Deployment

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

---

## Contract Functions

### Core Functions

| Function | Description | Access |
|----------|-------------|--------|
| `submitGeneticSample()` | Submit encrypted DNA sequence | Public |
| `requestAnalysis()` | Initiate FHE risk analysis | Patient |
| `requestResultDecryption()` | Request result decryption | Patient |
| `authorizeResearchLab()` | Grant lab access permissions | Owner |
| `revokeLabAuthorization()` | Revoke lab permissions | Owner |
| `updateDiseaseMarker()` | Update marker risk weights | Owner |
| `toggleDiseaseMarker()` | Activate/deactivate marker | Owner |
| `emergencyPause()` | Pause all analyses | Owner |
| `emergencyResume()` | Resume all analyses | Owner |

---

## Related Resources

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Zama GitHub](https://github.com/zama-ai/fhevm)
- [FHEVM Examples](https://github.com/zama-ai/fhevm/tree/main/examples)
- [Solidity Documentation](https://docs.soliditylang.org/)

---

## Security Best Practices

### ✅ Correct Pattern

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

### ❌ Anti-Pattern: Missing allowThis()

```solidity
function submitData(uint8 value) external {
    euint8 encrypted = FHE.asEuint8(value);
    // ❌ Missing FHE.allowThis() - contract can't operate on this!
    userData[msg.sender] = encrypted;
}
```

### ❌ Anti-Pattern: Missing user permission

```solidity
function submitData(uint8 value) external {
    euint8 encrypted = FHE.asEuint8(value);
    FHE.allowThis(encrypted);
    // ❌ Missing FHE.allow(encrypted, msg.sender) - user can't decrypt!
    userData[msg.sender] = encrypted;
}
```

---

## Common Pitfalls

1. **Missing FHE.allowThis()** - Contract can't perform operations on encrypted values
2. **Missing FHE.allow()** - User can't decrypt their own results
3. **Wrong access control** - Patients accessing other patients' data
4. **Unvalidated inputs** - Not checking value ranges before encryption
5. **Missing event emission** - No audit trail of operations

---

## FAQ

**Q: Does this work on Ethereum mainnet?**
A: Currently supports FHEVM testnets (Sepolia). Mainnet support coming soon.

**Q: What's the gas cost for genetic analysis?**
A: Approximately 1.2M gas for full analysis. Actual cost depends on network conditions.

**Q: Can I use real genetic data?**
A: This is a demonstration. For production use with real medical data, consult legal and compliance experts.

**Q: How secure is FHE encryption?**
A: FHEVM uses industry-standard TFHE encryption, providing strong cryptographic security.

---

*Part of the Zama December 2025 Bounty Track: Build FHEVM Example Hub*
