import { ethers } from "hardhat";

/**
 * @title Deployment Script
 * @notice Deploys the Template contract to the specified network
 */
async function main() {
    console.log("\n🚀 Deploying Template Contract...\n");

    // Get deployer account
    const [deployer] = await ethers.getSigners();
    const deployerAddress = await deployer.getAddress();

    // Check deployer balance
    const balance = await ethers.provider.getBalance(deployerAddress);

    console.log("Deploying from account:", deployerAddress);
    console.log("Account balance:", ethers.formatEther(balance), "ETH\n");

    // Get network information
    const network = await ethers.provider.getNetwork();
    console.log("Network:", network.name);
    console.log("Chain ID:", network.chainId.toString(), "\n");

    // Deploy contract
    const TemplateFactory = await ethers.getContractFactory("Template");
    const contract = await TemplateFactory.deploy();

    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();

    console.log("✅ Template deployed to:", contractAddress);
    console.log("   Deployer:", deployerAddress);
    console.log("   Network:", network.name);
    console.log("   Chain ID:", network.chainId.toString(), "\n");

    // Save deployment information
    const deploymentInfo = {
        contract: "Template",
        address: contractAddress,
        deployer: deployerAddress,
        network: network.name,
        chainId: network.chainId.toString(),
        timestamp: new Date().toISOString(),
    };

    console.log("Deployment Info:", JSON.stringify(deploymentInfo, null, 2), "\n");

    // Verification instructions
    if (network.name !== "hardhat" && network.name !== "localhost") {
        console.log("To verify on Etherscan:");
        console.log(`npx hardhat verify --network ${network.name} ${contractAddress}\n`);
    }

    console.log("✨ Deployment complete!\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:");
        console.error(error);
        process.exit(1);
    });
