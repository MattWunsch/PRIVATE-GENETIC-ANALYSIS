import { ethers } from "hardhat";

/**
 * @title Private Genetic Analysis Deployment Script
 * @notice Deploys the PrivateGeneticAnalysis contract to the specified network
 * @dev This script handles deployment to both local and testnet networks
 *
 * Usage:
 * ```bash
 * # Deploy to local network
 * npx hardhat run scripts/deploy.ts
 *
 * # Deploy to Sepolia testnet
 * npx hardhat run scripts/deploy.ts --network sepolia
 * ```
 */

async function main() {
  console.log("\n🚀 Starting Private Genetic Analysis Deployment\n");

  // Get deployment account
  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);

  console.log("📋 Deployment Information:");
  console.log("   Deploying Account:", deployer.address);
  console.log(
    "   Account Balance:",
    ethers.formatEther(balance),
    "ETH"
  );

  const network = await ethers.provider.getNetwork();
  console.log("   Network:", network.name);
  console.log("   Chain ID:", network.chainId.toString());
  console.log("");

  // Check minimum balance
  const minBalance = ethers.parseEther("0.1");
  if (balance < minBalance) {
    console.warn(
      "⚠️  Warning: Account balance is low. You may need more ETH for deployment.\n"
    );
  }

  // Deploy contract
  console.log("📦 Deploying PrivateGeneticAnalysis contract...\n");

  const PrivateGeneticAnalysis = await ethers.getContractFactory(
    "PrivateGeneticAnalysis"
  );
  const contract = await PrivateGeneticAnalysis.deploy();

  console.log("⏳ Waiting for deployment transaction to be mined...");
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();

  console.log("\n✅ Deployment Successful!\n");
  console.log("📍 Contract Information:");
  console.log("   Contract Address:", contractAddress);
  console.log("   Transaction Hash:", contract.deploymentTransaction()?.hash);
  console.log(
    "   Block Number:",
    contract.deploymentTransaction()?.blockNumber
  );
  console.log("");

  // Verify initial state
  console.log("🔍 Verifying Initial State...");
  const owner = await contract.owner();
  const totalSamples = await contract.totalSamples();

  console.log("   Owner:", owner);
  console.log("   Total Samples:", totalSamples.toString());

  // Check disease markers
  console.log("\n🧬 Disease Markers Configuration:");
  for (let i = 1; i <= 5; i++) {
    const marker = await contract.getDiseaseMarkerInfo(i);
    console.log(
      `   Disease ${i}: Risk Weight = ${marker.riskWeight}%, Active = ${marker.isActive}`
    );
  }

  console.log("\n📝 Next Steps:");
  console.log("   1. Save the contract address for frontend integration");
  console.log("   2. Verify the contract on block explorer (if on testnet)");
  console.log("   3. Test contract functions using the frontend or Hardhat console");
  console.log("");

  // Save deployment info to file
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId.toString(),
    contractAddress: contractAddress,
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    transactionHash: contract.deploymentTransaction()?.hash,
    blockNumber: contract.deploymentTransaction()?.blockNumber,
  };

  const fs = require("fs");
  const path = require("path");
  const deployDir = path.join(__dirname, "..", "deployments");

  if (!fs.existsSync(deployDir)) {
    fs.mkdirSync(deployDir, { recursive: true });
  }

  const deploymentFile = path.join(
    deployDir,
    `${network.name}-${Date.now()}.json`
  );
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

  console.log(`💾 Deployment info saved to: ${deploymentFile}\n`);

  // Etherscan verification instructions
  if (network.chainId === 11155111n) {
    // Sepolia
    console.log("🔗 Etherscan Verification:");
    console.log(
      "   Run the following command to verify your contract on Etherscan:\n"
    );
    console.log(
      `   npx hardhat verify --network sepolia ${contractAddress}\n`
    );
  }
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment Failed:\n");
    console.error(error);
    process.exit(1);
  });
