import { expect } from "chai";
import { ethers } from "hardhat";
import { Template } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

/**
 * @title Template Contract Tests
 * @notice Tests demonstrating FHEVM contract testing patterns
 * @dev This is a template for writing tests for your FHEVM contracts
 */
describe("Template", function () {
    let contract: Template;
    let owner: SignerWithAddress;
    let user: SignerWithAddress;

    beforeEach(async function () {
        [owner, user] = await ethers.getSigners();

        const TemplateFactory = await ethers.getContractFactory("Template");
        contract = await TemplateFactory.deploy();
        await contract.waitForDeployment();
    });

    describe("Deployment", function () {
        /**
         * @notice Should deploy successfully
         * @dev Verify contract is deployed and accessible
         */
        it("Should deploy successfully", async function () {
            expect(contract.getAddress()).to.not.be.undefined;
        });
    });

    describe("Store Value", function () {
        /**
         * @notice Should store encrypted value
         * @dev Demonstrates the FHE encryption workflow:
         *      1. User submits plaintext value
         *      2. Contract encrypts using FHE.asEuint8()
         *      3. Encrypted data is stored on-chain
         *      4. User gets FHE permissions via FHE.allow()
         */
        it("Should store encrypted value", async function () {
            const testValue = 42;

            // Store encrypted value
            await expect(contract.connect(user).storeValue(testValue))
                .to.emit(contract, "ValueStored")
                .withArgs(user.address, await ethers.provider.getBlock("latest").then(b => b!.timestamp + 1));

            // Verify we can retrieve the encrypted value
            const encrypted = await contract.connect(user).getEncryptedValue();
            expect(encrypted).to.exist;
        });

        /**
         * @notice Should emit ValueStored event
         * @dev Event emission is crucial for tracking off-chain
         */
        it("Should emit ValueStored event", async function () {
            const testValue = 42;

            await expect(contract.connect(user).storeValue(testValue))
                .to.emit(contract, "ValueStored");
        });
    });

    describe("Get Encrypted Value", function () {
        /**
         * @notice Should return encrypted value
         * @dev Verify that encrypted values can be retrieved as handles
         */
        it("Should return encrypted value", async function () {
            await contract.connect(user).storeValue(42);

            const encrypted = await contract.connect(user).getEncryptedValue();
            expect(encrypted).to.not.equal(0);
        });
    });
});
