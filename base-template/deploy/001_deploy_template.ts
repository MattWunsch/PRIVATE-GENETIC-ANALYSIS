import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * @title Hardhat Deploy Script
 * @notice Deploys Template contract using hardhat-deploy plugin
 * @dev This file follows the hardhat-deploy convention
 */
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    console.log("\n🚀 Deploying Template Contract...\n");
    console.log("Deployer:", deployer);

    const template = await deploy("Template", {
        from: deployer,
        args: [],
        log: true,
        autoMine: true,
    });

    console.log("✅ Template deployed to:", template.address);
    console.log("   Transaction hash:", template.transactionHash);
    console.log("   Gas used:", template.receipt?.gasUsed?.toString() || "N/A");
    console.log("\n");
};

export default func;
func.tags = ["Template"];
