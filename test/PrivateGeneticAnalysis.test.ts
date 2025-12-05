import { expect } from "chai";
import { ethers } from "hardhat";
import { PrivateGeneticAnalysis } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

/**
 * @title Private Genetic Analysis Test Suite
 * @notice Comprehensive test suite for FHEVM-based genetic analysis contract
 * @dev This test suite demonstrates key FHEVM concepts:
 *      - Encrypted data submission (DNA sequences)
 *      - FHE computations on encrypted genetic data
 *      - Access control for sensitive medical information
 *      - Decryption workflows for authorized users
 *
 * @chapter fhevm-genetic-analysis
 * @category healthcare
 * @complexity advanced
 */
describe("Private Genetic Analysis - FHEVM Example", function () {
  let contract: PrivateGeneticAnalysis;
  let owner: SignerWithAddress;
  let patient1: SignerWithAddress;
  let patient2: SignerWithAddress;
  let lab: SignerWithAddress;
  let unauthorized: SignerWithAddress;

  /**
   * @notice DNA nucleotide encoding used in genetic analysis
   * @dev Standard nucleotide to numeric mapping:
   *      A (Adenine) = 65
   *      T (Thymine) = 84
   *      C (Cytosine) = 67
   *      G (Guanine) = 71
   */
  const NUCLEOTIDES = {
    A: 65,  // Adenine
    T: 84,  // Thymine
    C: 67,  // Cytosine
    G: 71,  // Guanine
  };

  /**
   * @notice Helper function to generate a valid DNA sequence
   * @dev Creates a 32-nucleotide sequence with random base pairs
   * @returns Array of 32 numeric values representing DNA sequence
   */
  function generateDNASequence(): number[] {
    const nucleotides = [NUCLEOTIDES.A, NUCLEOTIDES.T, NUCLEOTIDES.C, NUCLEOTIDES.G];
    const sequence: number[] = [];
    for (let i = 0; i < 32; i++) {
      sequence.push(nucleotides[Math.floor(Math.random() * nucleotides.length)]);
    }
    return sequence;
  }

  /**
   * @notice Helper function to generate a DNA sequence with specific markers
   * @dev Creates a sequence containing disease marker patterns for testing
   * @param markerPattern The disease marker pattern to include
   * @returns Array of 32 numeric values with embedded marker
   */
  function generateDNAWithMarker(markerPattern: number[]): number[] {
    const sequence = generateDNASequence();
    // Insert marker at position 10-13
    for (let i = 0; i < markerPattern.length && i < 4; i++) {
      sequence[10 + i] = markerPattern[i];
    }
    return sequence;
  }

  /**
   * @notice Setup function executed before each test
   * @dev Deploys fresh contract instance and assigns test accounts
   */
  beforeEach(async function () {
    [owner, patient1, patient2, lab, unauthorized] = await ethers.getSigners();

    const PrivateGeneticAnalysis = await ethers.getContractFactory("PrivateGeneticAnalysis");
    contract = await PrivateGeneticAnalysis.deploy();
    await contract.waitForDeployment();
  });

  /**
   * @title Contract Deployment Tests
   * @notice Verifies correct contract initialization
   */
  describe("Deployment", function () {
    /**
     * @notice Should set the correct contract owner
     * @dev The deploying address should be set as the contract owner
     */
    it("Should set the right owner", async function () {
      expect(await contract.owner()).to.equal(owner.address);
    });

    /**
     * @notice Should initialize total samples to zero
     * @dev Counter should start at zero before any submissions
     */
    it("Should initialize total samples to 0", async function () {
      expect(await contract.totalSamples()).to.equal(0);
    });

    /**
     * @notice Should initialize disease markers correctly
     * @dev All 5 disease markers should be active with proper risk weights
     */
    it("Should initialize disease markers", async function () {
      for (let i = 1; i <= 5; i++) {
        const marker = await contract.getDiseaseMarkerInfo(i);
        expect(marker.isActive).to.be.true;
        expect(marker.riskWeight).to.be.greaterThan(0);
      }
    });
  });

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
      const dnaSequence = generateDNASequence();

      const tx = await contract.connect(patient1).submitGeneticSample(dnaSequence);
      await tx.wait();

      expect(await contract.totalSamples()).to.equal(1);

      const sampleInfo = await contract.getSampleInfo(patient1.address);
      expect(sampleInfo.submitted).to.be.true;
      expect(sampleInfo.complete).to.be.false;
    });

    /**
     * @notice Should emit SampleSubmitted event
     * @dev Events are crucial for off-chain tracking of encrypted operations
     */
    it("Should emit SampleSubmitted event", async function () {
      const dnaSequence = generateDNASequence();

      await expect(contract.connect(patient1).submitGeneticSample(dnaSequence))
        .to.emit(contract, "SampleSubmitted")
        .withArgs(patient1.address, await ethers.provider.getBlock("latest").then(b => b!.timestamp + 1));
    });

    /**
     * @notice Should prevent duplicate sample submissions
     * @dev Important security check: one sample per patient
     */
    it("Should not allow duplicate submissions from same patient", async function () {
      const dnaSequence = generateDNASequence();

      await contract.connect(patient1).submitGeneticSample(dnaSequence);

      await expect(
        contract.connect(patient1).submitGeneticSample(dnaSequence)
      ).to.be.revertedWith("Sample already submitted");
    });

    /**
     * @notice Should allow multiple patients to submit samples
     * @dev Each patient's encrypted data is isolated and private
     */
    it("Should allow multiple different patients to submit", async function () {
      const sequence1 = generateDNASequence();
      const sequence2 = generateDNASequence();

      await contract.connect(patient1).submitGeneticSample(sequence1);
      await contract.connect(patient2).submitGeneticSample(sequence2);

      expect(await contract.totalSamples()).to.equal(2);
    });
  });

  /**
   * @title Genetic Analysis Tests
   * @notice Tests for FHE computations on encrypted genetic data
   * @dev Demonstrates homomorphic operations on encrypted health data
   */
  describe("Genetic Analysis", function () {
    beforeEach(async function () {
      // Submit a sample before each analysis test
      const dnaSequence = generateDNASequence();
      await contract.connect(patient1).submitGeneticSample(dnaSequence);
    });

    /**
     * @notice Should allow patient to request analysis
     * @dev Tests FHE computation workflow:
     *      1. Patient requests analysis
     *      2. Contract performs encrypted comparisons (FHE.eq)
     *      3. Risk scores calculated using FHE arithmetic
     *      4. Results remain encrypted until decryption
     */
    it("Should allow patient to request analysis", async function () {
      const tx = await contract.connect(patient1).requestAnalysis();
      await tx.wait();

      const analysisStatus = await contract.getAnalysisStatus(patient1.address);
      expect(analysisStatus.analysisComplete).to.be.true;
      expect(analysisStatus.resultsReady).to.be.true;
    });

    /**
     * @notice Should emit analysis events
     * @dev Multiple events track the analysis pipeline
     */
    it("Should emit AnalysisStarted and AnalysisComplete events", async function () {
      await expect(contract.connect(patient1).requestAnalysis())
        .to.emit(contract, "AnalysisStarted")
        .and.to.emit(contract, "AnalysisComplete");
    });

    /**
     * @notice Should require sample submission before analysis
     * @dev Validates proper workflow ordering
     */
    it("Should not allow analysis without sample submission", async function () {
      await expect(
        contract.connect(patient2).requestAnalysis()
      ).to.be.revertedWith("No sample submitted");
    });

    /**
     * @notice Should prevent duplicate analysis requests
     * @dev Prevents redundant FHE computations
     */
    it("Should not allow duplicate analysis requests", async function () {
      await contract.connect(patient1).requestAnalysis();

      await expect(
        contract.connect(patient1).requestAnalysis()
      ).to.be.revertedWith("Analysis already complete");
    });

    /**
     * @notice Should update analysis status correctly
     * @dev Tracks multiple state variables through the workflow
     */
    it("Should update analysis status correctly", async function () {
      await contract.connect(patient1).requestAnalysis();

      const status = await contract.getAnalysisStatus(patient1.address);
      expect(status.sampleSubmitted).to.be.true;
      expect(status.analysisComplete).to.be.true;
      expect(status.resultsReady).to.be.true;
    });
  });

  /**
   * @title Access Control Tests
   * @notice Tests for privacy-preserving access control
   * @dev Demonstrates FHE access control patterns:
   *      - FHE.allow() grants decryption permissions
   *      - FHE.allowThis() permits contract operations
   *      - Role-based access (patient, lab, owner)
   */
  describe("Access Control", function () {
    /**
     * @notice Should allow patient to view their own status
     * @dev Patient has automatic access to their encrypted data
     */
    it("Should allow patient to view their own sample status", async function () {
      const dnaSequence = generateDNASequence();
      await contract.connect(patient1).submitGeneticSample(dnaSequence);

      const status = await contract.connect(patient1).getAnalysisStatus(patient1.address);
      expect(status.sampleSubmitted).to.be.true;
    });

    /**
     * @notice Should allow owner to view any patient's status
     * @dev Owner has administrative access for all records
     */
    it("Should allow owner to view any patient status", async function () {
      const dnaSequence = generateDNASequence();
      await contract.connect(patient1).submitGeneticSample(dnaSequence);

      const status = await contract.connect(owner).getAnalysisStatus(patient1.address);
      expect(status.sampleSubmitted).to.be.true;
    });

    /**
     * @notice Should prevent unauthorized access to patient data
     * @dev Critical privacy protection: patients can't access each other's data
     */
    it("Should not allow unauthorized access to patient data", async function () {
      const dnaSequence = generateDNASequence();
      await contract.connect(patient1).submitGeneticSample(dnaSequence);

      await expect(
        contract.connect(patient2).getAnalysisStatus(patient1.address)
      ).to.be.revertedWith("Not authorized");
    });

    /**
     * @notice Should allow authorized labs to access patient data
     * @dev Demonstrates role-based access control for medical professionals
     */
    it("Should allow authorized labs to access patient data", async function () {
      const dnaSequence = generateDNASequence();
      await contract.connect(patient1).submitGeneticSample(dnaSequence);

      await contract.connect(owner).authorizeResearchLab(lab.address);

      const status = await contract.connect(lab).getAnalysisStatus(patient1.address);
      expect(status.sampleSubmitted).to.be.true;
    });
  });

  /**
   * @title Laboratory Authorization Tests
   * @notice Tests for research lab access management
   */
  describe("Laboratory Authorization", function () {
    /**
     * @notice Should allow owner to authorize research labs
     * @dev Owner can grant lab access to all patient data
     */
    it("Should allow owner to authorize a research lab", async function () {
      const tx = await contract.connect(owner).authorizeResearchLab(lab.address);

      await expect(tx).to.emit(contract, "LabAuthorized").withArgs(lab.address);

      expect(await contract.authorizedLabs(lab.address)).to.be.true;
    });

    /**
     * @notice Should allow owner to revoke lab authorization
     * @dev Access can be revoked to maintain patient privacy
     */
    it("Should allow owner to revoke lab authorization", async function () {
      await contract.connect(owner).authorizeResearchLab(lab.address);
      await contract.connect(owner).revokeLabAuthorization(lab.address);

      expect(await contract.authorizedLabs(lab.address)).to.be.false;
    });

    /**
     * @notice Should prevent non-owners from authorizing labs
     * @dev Only contract owner can manage lab authorizations
     */
    it("Should not allow non-owner to authorize labs", async function () {
      await expect(
        contract.connect(patient1).authorizeResearchLab(lab.address)
      ).to.be.revertedWith("Not authorized");
    });
  });

  /**
   * @title Disease Marker Management Tests
   * @notice Tests for updating disease risk parameters
   */
  describe("Disease Marker Management", function () {
    /**
     * @notice Should allow owner to update disease marker risk weights
     * @dev Risk weights affect FHE risk score calculations
     */
    it("Should allow owner to update disease marker", async function () {
      const newRiskWeight = 90;

      const tx = await contract.connect(owner).updateDiseaseMarker(1, newRiskWeight);

      await expect(tx)
        .to.emit(contract, "MarkerUpdated")
        .withArgs(1, newRiskWeight);

      const marker = await contract.getDiseaseMarkerInfo(1);
      expect(marker.riskWeight).to.equal(newRiskWeight);
    });

    /**
     * @notice Should allow owner to toggle disease marker active status
     * @dev Inactive markers are excluded from analysis
     */
    it("Should allow owner to toggle disease marker", async function () {
      await contract.connect(owner).toggleDiseaseMarker(1);

      const marker = await contract.getDiseaseMarkerInfo(1);
      expect(marker.isActive).to.be.false;

      await contract.connect(owner).toggleDiseaseMarker(1);

      const markerAfter = await contract.getDiseaseMarkerInfo(1);
      expect(markerAfter.isActive).to.be.true;
    });

    /**
     * @notice Should validate disease ID range
     * @dev Only disease IDs 1-5 are valid
     */
    it("Should not allow invalid disease ID", async function () {
      await expect(
        contract.connect(owner).updateDiseaseMarker(6, 50)
      ).to.be.revertedWith("Invalid disease ID");
    });

    /**
     * @notice Should validate risk weight range
     * @dev Risk weight must be 0-100 (percentage)
     */
    it("Should not allow risk weight > 100", async function () {
      await expect(
        contract.connect(owner).updateDiseaseMarker(1, 101)
      ).to.be.revertedWith("Risk weight must be <= 100");
    });
  });

  /**
   * @title Emergency Controls Tests
   * @notice Tests for emergency pause/resume functionality
   */
  describe("Emergency Controls", function () {
    /**
     * @notice Should allow owner to emergency pause all markers
     * @dev Pauses all genetic analysis in emergency situations
     */
    it("Should allow owner to emergency pause", async function () {
      await contract.connect(owner).emergencyPause();

      for (let i = 1; i <= 5; i++) {
        const marker = await contract.getDiseaseMarkerInfo(i);
        expect(marker.isActive).to.be.false;
      }
    });

    /**
     * @notice Should allow owner to emergency resume all markers
     * @dev Resumes all genetic analysis after emergency resolved
     */
    it("Should allow owner to emergency resume", async function () {
      await contract.connect(owner).emergencyPause();
      await contract.connect(owner).emergencyResume();

      for (let i = 1; i <= 5; i++) {
        const marker = await contract.getDiseaseMarkerInfo(i);
        expect(marker.isActive).to.be.true;
      }
    });

    /**
     * @notice Should prevent non-owners from emergency controls
     * @dev Only owner can pause/resume the system
     */
    it("Should not allow non-owner to emergency pause", async function () {
      await expect(
        contract.connect(patient1).emergencyPause()
      ).to.be.revertedWith("Not authorized");
    });
  });

  /**
   * @title Contract Statistics Tests
   * @notice Tests for contract analytics and monitoring
   */
  describe("Contract Statistics", function () {
    /**
     * @notice Should return correct contract statistics
     * @dev Provides aggregate metrics for monitoring
     */
    it("Should return correct contract stats", async function () {
      const sequence1 = generateDNASequence();
      const sequence2 = generateDNASequence();

      await contract.connect(patient1).submitGeneticSample(sequence1);
      await contract.connect(patient2).submitGeneticSample(sequence2);

      const stats = await contract.getContractStats();
      expect(stats.totalSubmissions).to.equal(2);
      expect(stats.contractOwner).to.equal(owner.address);
    });

    /**
     * @notice Should track analysis request IDs correctly
     * @dev Request IDs increment with each analysis
     */
    it("Should track analysis request IDs", async function () {
      const dnaSequence = generateDNASequence();

      await contract.connect(patient1).submitGeneticSample(dnaSequence);
      await contract.connect(patient1).requestAnalysis();

      expect(await contract.analysisRequestId()).to.equal(1);
    });
  });

  /**
   * @title End-to-End Workflow Tests
   * @notice Tests complete genetic analysis workflow
   * @dev Demonstrates full FHEVM workflow from submission to result decryption
   */
  describe("Complete Workflow", function () {
    /**
     * @notice Should complete full genetic analysis workflow
     * @dev Tests the complete flow:
     *      1. Submit encrypted DNA sample
     *      2. Request FHE analysis
     *      3. Verify encrypted results are ready
     *      4. Request decryption (note: actual decryption requires oracle)
     */
    it("Should complete full workflow: submit -> analyze -> decrypt request", async function () {
      // Step 1: Submit DNA sample (data encrypted with FHE)
      const dnaSequence = generateDNASequence();
      await contract.connect(patient1).submitGeneticSample(dnaSequence);

      // Verify sample submitted
      let status = await contract.getAnalysisStatus(patient1.address);
      expect(status.sampleSubmitted).to.be.true;
      expect(status.analysisComplete).to.be.false;

      // Step 2: Request analysis (FHE computations on encrypted data)
      await contract.connect(patient1).requestAnalysis();

      // Verify analysis complete
      status = await contract.getAnalysisStatus(patient1.address);
      expect(status.analysisComplete).to.be.true;
      expect(status.resultsReady).to.be.true;

      // Step 3: Request decryption
      // Note: In production, this triggers oracle-based decryption
      const tx = await contract.connect(patient1).requestResultDecryption();
      await tx.wait();

      // Results are encrypted until oracle provides decryption
      expect(tx).to.not.be.reverted;
    });

    /**
     * @notice Should handle multiple patients independently
     * @dev Each patient's encrypted data is completely isolated
     */
    it("Should handle multiple patients independently", async function () {
      const sequence1 = generateDNASequence();
      const sequence2 = generateDNASequence();

      // Patient 1 workflow
      await contract.connect(patient1).submitGeneticSample(sequence1);
      await contract.connect(patient1).requestAnalysis();

      // Patient 2 workflow
      await contract.connect(patient2).submitGeneticSample(sequence2);
      await contract.connect(patient2).requestAnalysis();

      // Verify both patients completed independently
      const status1 = await contract.getAnalysisStatus(patient1.address);
      const status2 = await contract.getAnalysisStatus(patient2.address);

      expect(status1.resultsReady).to.be.true;
      expect(status2.resultsReady).to.be.true;

      // Verify data isolation
      await expect(
        contract.connect(patient1).getAnalysisStatus(patient2.address)
      ).to.be.revertedWith("Not authorized");
    });
  });

  /**
   * @title FHE Security Anti-Pattern Tests
   * @notice Tests demonstrating common FHE security mistakes to avoid
   * @dev Educational tests showing what NOT to do with FHE
   */
  describe("Security & Anti-Patterns", function () {
    /**
     * @notice Should demonstrate proper access control setup
     * @dev Shows correct use of FHE.allow() and FHE.allowThis()
     *      IMPORTANT: Always grant permissions after encrypting data
     */
    it("Should demonstrate correct FHE access control pattern", async function () {
      const dnaSequence = generateDNASequence();

      // Correct pattern: submitGeneticSample uses:
      // 1. FHE.asEuint8(value) - encrypt data
      // 2. FHE.allowThis(encrypted) - allow contract access
      // 3. FHE.allow(encrypted, patient) - allow patient access

      await contract.connect(patient1).submitGeneticSample(dnaSequence);

      // Patient can access their own data
      const status = await contract.getSampleInfo(patient1.address);
      expect(status.submitted).to.be.true;
    });

    /**
     * @notice Anti-pattern: Attempting to access data without proper analysis
     * @dev Shows importance of workflow validation
     */
    it("Anti-pattern: Should prevent skipping required workflow steps", async function () {
      // Anti-pattern: Trying to decrypt without analysis
      await expect(
        contract.connect(patient1).requestResultDecryption()
      ).to.be.revertedWith("Analysis not complete");
    });

    /**
     * @notice Should enforce strict access control boundaries
     * @dev Critical security: encrypted data must not leak across patients
     */
    it("Should maintain strict data isolation between patients", async function () {
      const sequence1 = generateDNASequence();
      await contract.connect(patient1).submitGeneticSample(sequence1);

      // Patient 2 cannot access patient 1's data
      await expect(
        contract.connect(patient2).getSampleInfo(patient1.address)
      ).to.be.revertedWith("Not authorized");

      // Even with submitted sample, isolation maintained
      const sequence2 = generateDNASequence();
      await contract.connect(patient2).submitGeneticSample(sequence2);

      await expect(
        contract.connect(patient2).getAnalysisStatus(patient1.address)
      ).to.be.revertedWith("Not authorized");
    });
  });
});

/**
 * @summary Test Suite Summary
 *
 * This comprehensive test suite demonstrates the FHEVM Private Genetic Analysis example,
 * showcasing key concepts:
 *
 * 1. **FHE Encryption**: DNA sequences encrypted using FHE.asEuint8()
 * 2. **Homomorphic Operations**: Risk calculations on encrypted data using FHE.add(), FHE.mul(), FHE.eq()
 * 3. **Access Control**: Proper use of FHE.allow() and FHE.allowThis() for privacy
 * 4. **Decryption Workflow**: Oracle-based result decryption for authorized users
 * 5. **Security Patterns**: Demonstrates correct FHE usage and common anti-patterns
 *
 * @example Running Tests
 * ```bash
 * # Run all tests
 * npx hardhat test
 *
 * # Run with gas reporting
 * REPORT_GAS=true npx hardhat test
 *
 * # Run with coverage
 * npx hardhat coverage
 * ```
 *
 * @see https://docs.zama.ai/fhevm for FHEVM documentation
 * @see https://github.com/zama-ai/fhevm for FHEVM examples
 */
