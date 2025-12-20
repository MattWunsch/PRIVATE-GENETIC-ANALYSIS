# FHEVM Examples Documentation

Welcome to the FHEVM examples documentation. This collection demonstrates privacy-preserving smart contracts using Zama's Fully Homomorphic Encryption.

## Available Examples

### [Private Genetic Analysis](PrivateGeneticAnalysis.md)

**Category:** Healthcare & Privacy

A comprehensive example demonstrating privacy-preserving genetic analysis on blockchain. This example showcases:

- **FHE Encryption:** Encrypting sensitive DNA data on-chain
- **Homomorphic Computations:** Performing risk analysis on encrypted data
- **Access Control:** Role-based permissions for genetic information
- **Decryption Workflows:** Oracle-based secure decryption
- **Real-World Use Case:** Healthcare privacy for genetic testing services

**Complexity:** Advanced

**Key Concepts:**
- Encrypted data submission
- Homomorphic comparison and arithmetic
- Access control patterns
- Multi-patient data isolation
- Laboratory authorization system

---

## Getting Started

### 1. Understanding FHEVM Basics

If you're new to FHEVM, start with these concepts:

- **FHE.asEuint8()** - Encrypt 8-bit unsigned integers
- **FHE.allowThis()** - Grant contract permission to operate on encrypted values
- **FHE.allow()** - Grant user permission to decrypt values
- **FHE.eq()** - Compare encrypted values without decryption
- **FHE.add(), FHE.mul(), FHE.sub()** - Arithmetic on encrypted data

### 2. Run the Tests

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run specific example tests
npm test -- --grep "Private Genetic Analysis"
```

### 3. Review the Contract

```bash
# Read the contract
cat contracts/PrivateGeneticAnalysis.sol

# Read the tests
cat test/PrivateGeneticAnalysis.test.ts
```

### 4. Deploy Locally

```bash
# Terminal 1: Start local node
npx hardhat node

# Terminal 2: Deploy contract
npx hardhat run scripts/deploy.ts --network localhost
```

### 5. Experiment

```bash
# Modify the contract
# Add new functions
# Write new tests
# Deploy and test
```

---

## FHEVM Concepts

### Encryption (FHE.asEuint8)

Convert plaintext data to encrypted format:

```solidity
euint8 encrypted = FHE.asEuint8(value);
```

**Use Cases:**
- Encrypt user input data
- Create encrypted constants
- Initialize encrypted state variables

### Access Control (FHE.allow, FHE.allowThis)

Grant permissions for encrypted operations:

```solidity
// Allow contract to operate on value
FHE.allowThis(encrypted);

// Allow user to decrypt value
FHE.allow(encrypted, msg.sender);
```

**Critical Pattern:**
- Always call both methods when creating encrypted values
- Missing either will cause operations to fail
- This is the primary security mechanism in FHEVM

### Homomorphic Comparison (FHE.eq)

Compare encrypted values without decryption:

```solidity
ebool result = FHE.eq(encrypted1, encrypted2);
```

**Returns:** Encrypted boolean (ebool)

**Common Pattern:**
```solidity
ebool isMatch = FHE.eq(value1, value2);
euint8 matchScore = FHE.select(isMatch,
    FHE.asEuint8(1),
    FHE.asEuint8(0)
);
```

### Encrypted Arithmetic

Perform math on encrypted data:

```solidity
euint8 sum = FHE.add(a, b);
euint8 product = FHE.mul(a, b);
euint8 difference = FHE.sub(a, b);
euint8 quotient = FHE.shr(a, 1); // Divide by 2
euint8 maximum = FHE.max(a, b);
euint8 minimum = FHE.min(a, b);
```

### Conditional Operations (FHE.select)

Perform if-then-else on encrypted values:

```solidity
euint8 result = FHE.select(
    condition,      // ebool
    trueValue,      // euint8
    falseValue      // euint8
);
```

---

## Workflow Patterns

### Basic Encrypted Storage

```solidity
// 1. Accept plaintext from user
function storeValue(uint8 value) external {
    // 2. Encrypt the value
    euint8 encrypted = FHE.asEuint8(value);

    // 3. Grant permissions
    FHE.allowThis(encrypted);
    FHE.allow(encrypted, msg.sender);

    // 4. Store on-chain
    userData[msg.sender] = encrypted;
}
```

### Homomorphic Computation

```solidity
// 1. Retrieve encrypted data
euint8 storedValue = userData[msg.sender];

// 2. Perform computation on encrypted data
euint8 doubled = FHE.add(storedValue, storedValue);

// 3. Grant permissions for result
FHE.allowThis(doubled);
FHE.allow(doubled, msg.sender);

// 4. Store result
results[msg.sender] = doubled;
```

### Access Control

```solidity
// Only patient or authorized lab can access
require(
    msg.sender == patient ||
    authorizedLabs[msg.sender] ||
    msg.sender == owner,
    "Not authorized"
);

// Proceed with operation on encrypted data
```

---

## Testing Patterns

### Test Setup

```typescript
describe("Feature Name", function () {
    let contract: ContractType;
    let owner: SignerWithAddress;
    let user: SignerWithAddress;

    beforeEach(async function () {
        [owner, user] = await ethers.getSigners();
        const ContractFactory = await ethers.getContractFactory("ContractName");
        contract = await ContractFactory.deploy();
        await contract.waitForDeployment();
    });

    it("Should do something", async function () {
        // Test implementation
    });
});
```

### Test Encrypted Operations

```typescript
it("Should handle encrypted operations", async function () {
    // Submit encrypted data
    const plainValue = 42;
    const tx = await contract.submitData(plainValue);
    await tx.wait();

    // Verify state changed
    const stored = await contract.getStoredValue(user.address);
    expect(stored).to.exist;

    // Note: We can't directly compare encrypted values
    // Instead, verify through observable behavior
});
```

### Test Access Control

```typescript
it("Should enforce access control", async function () {
    // Authorized user succeeds
    await expect(contract.connect(owner).sensitiveFunction())
        .to.not.be.reverted;

    // Unauthorized user fails
    await expect(contract.connect(unauthorized).sensitiveFunction())
        .to.be.revertedWith("Not authorized");
});
```

---

## Common Issues & Solutions

### Issue: "Permission Denied" Error

**Cause:** Missing FHE.allowThis() or FHE.allow()

**Solution:**
```solidity
euint8 value = FHE.asEuint8(42);
FHE.allowThis(value);         // Add this line
FHE.allow(value, msg.sender);  // And this line
```

### Issue: Compilation Errors

**Cause:** Wrong import paths

**Solution:**
```solidity
// Correct imports
import { FHE, euint8, euint16, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";
```

### Issue: Tests Fail with Timeout

**Cause:** FHEVM operations are slower than regular EVM operations

**Solution:**
```typescript
// Increase timeout in test
it("Should complete FHE operations", async function () {
    this.timeout(100000); // 100 seconds
    // Test implementation
}).timeout(100000);
```

---

## Best Practices

### Contract Development

✅ **DO:**
- Always grant both FHE.allowThis() and FHE.allow()
- Use meaningful variable names
- Add comprehensive comments
- Include access control checks
- Emit events for important operations
- Test edge cases

❌ **DON'T:**
- Forget access control modifiers
- Operate on encrypted values without allowThis()
- Mix encrypted and plaintext operations carelessly
- Trust user input without validation
- Skip events for audit trails

### Testing

✅ **DO:**
- Test both success and failure cases
- Include access control tests
- Test edge cases
- Document test intent in comments
- Use descriptive test names

❌ **DON'T:**
- Test only the happy path
- Skip access control testing
- Use cryptic test descriptions
- Assume encrypted operations work like plaintext

### Documentation

✅ **DO:**
- Document why, not just what
- Include code examples
- Explain security implications
- Link to external resources
- Keep documentation up-to-date

❌ **DON'T:**
- Write cryptic comments
- Assume readers know FHEVM
- Skip security considerations
- Forget to update docs when code changes

---

## Resources

### Official Documentation
- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Zama GitHub](https://github.com/zama-ai/fhevm)
- [Hardhat Documentation](https://hardhat.org/docs)

### Community
- [Zama Discord](https://discord.com/invite/zama)
- [FHEVM Forum](https://community.zama.ai/)
- [Zama Twitter](https://twitter.com/zama_fhe)

### Tools
- [Etherscan](https://etherscan.io/)
- [MetaMask](https://metamask.io/)
- [Sepolia Faucet](https://sepoliafaucet.com/)

---

## Next Steps

1. **Read PrivateGeneticAnalysis.md** - Deep dive into the healthcare example
2. **Study the Contract** - Review `contracts/PrivateGeneticAnalysis.sol`
3. **Review the Tests** - Learn from `test/PrivateGeneticAnalysis.test.ts`
4. **Run Locally** - Deploy and test on your machine
5. **Modify and Experiment** - Create your own version
6. **Create New Examples** - Build additional use cases

---

## Support

- See the example README files for specific questions
- Check FHEVM documentation for API details
- Ask in Zama Discord for community help
- Create GitHub issues for bugs

---

*FHEVM Examples Documentation - Part of Zama December 2025 Bounty Track*
