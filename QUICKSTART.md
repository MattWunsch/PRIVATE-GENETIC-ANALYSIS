# Quick Start Guide

Get the Private Genetic Analysis project running in 5 minutes!

## Prerequisites

- Node.js >= 18
- npm or yarn
- MetaMask browser extension (for frontend testing)

## Installation (2 minutes)

```bash
# Navigate to project directory
cd PrivateGeneticAnalysis

# Install dependencies
npm install

# Compile contracts
npm run compile
```

## Run Tests (1 minute)

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- --grep "DNA Sample"

# Run with gas reporting
REPORT_GAS=true npm test
```

## Local Development (1 minute)

```bash
# Terminal 1: Start local Hardhat node
npm run node

# Terminal 2: Deploy contract (in new terminal)
npm run deploy

# Terminal 3: Serve frontend
cd frontend
python -m http.server 8000
```

## Access Frontend

Open your browser and navigate to: `http://localhost:8000`

**Or directly open:** `frontend/index.html`

## Testnet Deployment (1 minute)

```bash
# 1. Configure environment
cp .env.example .env
# Edit .env with your Sepolia RPC URL and private key

# 2. Deploy to Sepolia
npm run deploy:sepolia

# 3. Update contract address in frontend/app.js with deployed address
```

## Generate Documentation

```bash
npm run generate:docs
```

Documentation will be created in `docs/` directory.

## Common Commands

| Command | Purpose |
|---------|---------|
| `npm run compile` | Compile Solidity contracts |
| `npm test` | Run test suite |
| `npm run deploy` | Deploy to local network |
| `npm run deploy:sepolia` | Deploy to Sepolia testnet |
| `npm run generate:docs` | Generate documentation |
| `npm run clean` | Clean build artifacts |

## Troubleshooting

### Tests Failing
```bash
# Clean and rebuild
npm run clean
npm run compile
npm test
```

### MetaMask Connection Issues
1. Ensure MetaMask is installed
2. Switch network to Sepolia
3. Refresh the page
4. Clear browser cache

### Contract Deployment Fails
1. Check `.env` file configuration
2. Ensure account has sufficient ETH
3. Verify network connectivity
4. Check gas settings

## Next Steps

1. **Read the README** - Full documentation in `README.md`
2. **Study the Tests** - Learn FHEVM patterns in `test/PrivateGeneticAnalysis.test.ts`
3. **Review the Contract** - Smart contract logic in `contracts/PrivateGeneticAnalysis.sol`
4. **Explore the Frontend** - Web interface in `frontend/`
5. **Use Automation Tools** - Create examples with `automation/create-example.ts`

## Support

- See `README.md` for comprehensive documentation
- Check `SUBMISSION_GUIDE.md` for project details
- Review test files for usage examples
- Visit [FHEVM Docs](https://docs.zama.ai/fhevm) for FHEVM help

---

**You're all set! 🚀**
