import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * @title Hardhat Deploy Script for Private Genetic Analysis
 * @notice Deploys PrivateGeneticAnalysis contract using hardhat-deploy plugin
 * @dev This file follows the hardhat-deploy convention
 */
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts, ethers } = hre;
    const { deploy } = deployments;

    // Get deployer account
    const [deployer] = await ethers.getSigners();
    const deployerAddress = await deployer.getAddress();

    console.log("\n🚀 Deploying Private Genetic Analysis Contract...\n");
    console.log("Deployer:", deployerAddress);

    // Check balance
    const balance = await ethers.provider.getBalance(deployerAddress);
    console.log("Balance:", ethers.formatEther(balance), "ETH\n");

    // Deploy contract
    const privateGeneticAnalysis = await deploy("PrivateGeneticAnalysis", {
        from: deployerAddress,
        args: [],
        log: true,
        autoMine: true,
    });

    console.log("✅ PrivateGeneticAnalysis deployed to:", privateGeneticAnalysis.address);
    console.log("   Transaction hash:", privateGeneticAnalysis.transactionHash);
    console.log("   Gas used:", privateGeneticAnalysis.receipt?.gasUsed?.toString() || "N/A");

    // Verify deployment
    const contract = await ethers.getContractAt(
        "PrivateGeneticAnalysis",
        privateGeneticAnalysis.address
    );

    // Check initialization
    const owner = await contract.owner();
    const totalSamples = await contract.totalSamples();

    console.log("\n📊 Contract State:");
    console.log("   Owner:", owner);
    console.log("   Total Samples:", totalSamples.toString());

    // Verify disease markers
    console.log("\n🧬 Disease Markers:");
    for (let i = 1; i <= 5; i++) {
        const marker = await contract.getDiseaseMarkerInfo(i);
        console.log(`   Marker ${i}:`, {
            diseaseId: marker.diseaseId.toString(),
            riskWeight: marker.riskWeight.toString() + "%",
            isActive: marker.isActive,
        });
    }

    console.log("\n✨ Deployment complete!\n");

    // Save deployment info
    const network = await ethers.provider.getNetwork();
    if (network.name !== "hardhat" && network.name !== "localhost") {
        console.log("To verify on Etherscan:");
        console.log(
            `npx hardhat verify --network ${network.name} ${privateGeneticAnalysis.address}\n`
        );
    }
};

export default func;
func.tags = ["PrivateGeneticAnalysis"];
