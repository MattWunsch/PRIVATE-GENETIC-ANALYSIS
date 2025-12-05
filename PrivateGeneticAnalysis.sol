// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint8, euint16, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract PrivateGeneticAnalysis is SepoliaConfig {

    address public owner;
    uint16 public totalSamples;
    uint256 public analysisRequestId;

    struct GeneticSample {
        euint8[32] geneSequence;
        bool sampleSubmitted;
        uint256 submissionTime;
        bool analysisComplete;
        euint8 riskScore;
        uint8 diseaseType;
    }

    struct DiseaseMarker {
        euint8[4] markerPattern;
        uint8 diseaseId;
        uint8 riskWeight;
        bool isActive;
    }

    struct AnalysisResult {
        euint8 overallRiskScore;
        euint8[5] diseaseRisks;
        bool resultsReady;
        uint256 analysisTime;
        bool resultsDecrypted;
    }

    mapping(address => GeneticSample) public geneticSamples;
    mapping(uint8 => DiseaseMarker) public diseaseMarkers;
    mapping(address => AnalysisResult) public analysisResults;
    mapping(address => bool) public authorizedLabs;

    event SampleSubmitted(address indexed patient, uint256 timestamp);
    event AnalysisStarted(address indexed patient, uint256 requestId);
    event AnalysisComplete(address indexed patient, uint256 timestamp);
    event ResultsDecrypted(address indexed patient, uint8 overallRisk);
    event LabAuthorized(address indexed lab);
    event MarkerUpdated(uint8 diseaseId, uint8 riskWeight);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    modifier onlyAuthorizedLab() {
        require(authorizedLabs[msg.sender] || msg.sender == owner, "Not authorized lab");
        _;
    }

    modifier onlyPatientOrLab(address patient) {
        require(msg.sender == patient || authorizedLabs[msg.sender] || msg.sender == owner, "Not authorized");
        _;
    }

    constructor() {
        owner = msg.sender;
        totalSamples = 0;
        analysisRequestId = 0;

        _initializeDiseaseMarkers();
    }

    function _initializeDiseaseMarkers() private {
        diseaseMarkers[1] = DiseaseMarker({
            markerPattern: [FHE.asEuint8(65), FHE.asEuint8(84), FHE.asEuint8(67), FHE.asEuint8(71)],
            diseaseId: 1,
            riskWeight: 85,
            isActive: true
        });

        diseaseMarkers[2] = DiseaseMarker({
            markerPattern: [FHE.asEuint8(71), FHE.asEuint8(67), FHE.asEuint8(84), FHE.asEuint8(65)],
            diseaseId: 2,
            riskWeight: 75,
            isActive: true
        });

        diseaseMarkers[3] = DiseaseMarker({
            markerPattern: [FHE.asEuint8(84), FHE.asEuint8(84), FHE.asEuint8(65), FHE.asEuint8(65)],
            diseaseId: 3,
            riskWeight: 65,
            isActive: true
        });

        diseaseMarkers[4] = DiseaseMarker({
            markerPattern: [FHE.asEuint8(67), FHE.asEuint8(67), FHE.asEuint8(71), FHE.asEuint8(71)],
            diseaseId: 4,
            riskWeight: 70,
            isActive: true
        });

        diseaseMarkers[5] = DiseaseMarker({
            markerPattern: [FHE.asEuint8(65), FHE.asEuint8(65), FHE.asEuint8(84), FHE.asEuint8(84)],
            diseaseId: 5,
            riskWeight: 60,
            isActive: true
        });
    }

    function authorizeResearchLab(address lab) external onlyOwner {
        authorizedLabs[lab] = true;
        emit LabAuthorized(lab);
    }

    function revokeLabAuthorization(address lab) external onlyOwner {
        authorizedLabs[lab] = false;
    }

    function submitGeneticSample(uint8[32] calldata geneData) external {
        require(!geneticSamples[msg.sender].sampleSubmitted, "Sample already submitted");

        euint8[32] memory encryptedSequence;
        for (uint i = 0; i < 32; i++) {
            encryptedSequence[i] = FHE.asEuint8(geneData[i]);
            FHE.allowThis(encryptedSequence[i]);
            FHE.allow(encryptedSequence[i], msg.sender);
        }

        geneticSamples[msg.sender] = GeneticSample({
            geneSequence: encryptedSequence,
            sampleSubmitted: true,
            submissionTime: block.timestamp,
            analysisComplete: false,
            riskScore: FHE.asEuint8(0),
            diseaseType: 0
        });

        totalSamples++;
        emit SampleSubmitted(msg.sender, block.timestamp);
    }

    function requestAnalysis() external {
        require(geneticSamples[msg.sender].sampleSubmitted, "No sample submitted");
        require(!geneticSamples[msg.sender].analysisComplete, "Analysis already complete");

        analysisRequestId++;

        euint8[5] memory diseaseRisks;
        euint8 totalRisk = FHE.asEuint8(0);

        for (uint8 diseaseId = 1; diseaseId <= 5; diseaseId++) {
            if (diseaseMarkers[diseaseId].isActive) {
                euint8 risk = _calculateDiseaseRisk(msg.sender, diseaseId);
                diseaseRisks[diseaseId - 1] = risk;
                totalRisk = FHE.add(totalRisk, risk);
            }
        }

        euint8 averageRisk = FHE.mul(totalRisk, FHE.asEuint8(51));
        averageRisk = FHE.shr(averageRisk, 8);

        analysisResults[msg.sender] = AnalysisResult({
            overallRiskScore: averageRisk,
            diseaseRisks: diseaseRisks,
            resultsReady: true,
            analysisTime: block.timestamp,
            resultsDecrypted: false
        });

        geneticSamples[msg.sender].analysisComplete = true;
        geneticSamples[msg.sender].riskScore = averageRisk;

        FHE.allowThis(averageRisk);
        FHE.allow(averageRisk, msg.sender);

        for (uint i = 0; i < 5; i++) {
            FHE.allowThis(diseaseRisks[i]);
            FHE.allow(diseaseRisks[i], msg.sender);
        }

        emit AnalysisStarted(msg.sender, analysisRequestId);
        emit AnalysisComplete(msg.sender, block.timestamp);
    }

    function _calculateDiseaseRisk(address patient, uint8 diseaseId) private returns (euint8) {
        DiseaseMarker storage marker = diseaseMarkers[diseaseId];
        GeneticSample storage sample = geneticSamples[patient];

        euint8 matchCount = FHE.asEuint8(0);

        for (uint i = 0; i < 4; i++) {
            for (uint j = 0; j < 28; j++) {
                ebool isMatch = FHE.eq(sample.geneSequence[j], marker.markerPattern[i]);
                euint8 matchValue = FHE.select(isMatch, FHE.asEuint8(1), FHE.asEuint8(0));
                matchCount = FHE.add(matchCount, matchValue);
            }
        }

        euint8 riskPercentage = FHE.mul(matchCount, FHE.asEuint8(marker.riskWeight));
        euint8 normalizedRisk = FHE.mul(riskPercentage, FHE.asEuint8(64));
        normalizedRisk = FHE.shr(normalizedRisk, 8);

        return FHE.min(normalizedRisk, FHE.asEuint8(100));
    }

    function requestResultDecryption() external {
        require(analysisResults[msg.sender].resultsReady, "Analysis not complete");
        require(!analysisResults[msg.sender].resultsDecrypted, "Results already decrypted");

        AnalysisResult storage result = analysisResults[msg.sender];

        bytes32[] memory cts = new bytes32[](6);
        cts[0] = FHE.toBytes32(result.overallRiskScore);
        for (uint i = 0; i < 5; i++) {
            cts[i + 1] = FHE.toBytes32(result.diseaseRisks[i]);
        }

        FHE.requestDecryption(cts, this.processResultDecryption.selector);
    }

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
        bytes memory decryptedValues = abi.encode(overallRisk, risk1, risk2, risk3, risk4, risk5);

        FHE.checkSignatures(requestId, decryptedValues, signatures);

        address patient = _findPatientByRequestId(requestId);
        require(patient != address(0), "Invalid request");

        analysisResults[patient].resultsDecrypted = true;

        emit ResultsDecrypted(patient, overallRisk);
    }

    function _findPatientByRequestId(uint256 requestId) private pure returns (address) {
        return address(uint160(requestId));
    }

    function getAnalysisStatus(address patient) external view onlyPatientOrLab(patient) returns (
        bool sampleSubmitted,
        bool analysisComplete,
        bool resultsReady,
        uint256 submissionTime,
        uint256 analysisTime
    ) {
        GeneticSample storage sample = geneticSamples[patient];
        AnalysisResult storage result = analysisResults[patient];

        return (
            sample.sampleSubmitted,
            sample.analysisComplete,
            result.resultsReady,
            sample.submissionTime,
            result.analysisTime
        );
    }

    function getSampleInfo(address patient) external view onlyPatientOrLab(patient) returns (
        bool submitted,
        uint256 timestamp,
        bool complete
    ) {
        GeneticSample storage sample = geneticSamples[patient];
        return (
            sample.sampleSubmitted,
            sample.submissionTime,
            sample.analysisComplete
        );
    }

    function getDiseaseMarkerInfo(uint8 diseaseId) external view returns (
        uint8 riskWeight,
        bool isActive
    ) {
        require(diseaseId >= 1 && diseaseId <= 5, "Invalid disease ID");
        DiseaseMarker storage marker = diseaseMarkers[diseaseId];
        return (marker.riskWeight, marker.isActive);
    }

    function updateDiseaseMarker(uint8 diseaseId, uint8 newRiskWeight) external onlyOwner {
        require(diseaseId >= 1 && diseaseId <= 5, "Invalid disease ID");
        require(newRiskWeight <= 100, "Risk weight must be <= 100");

        diseaseMarkers[diseaseId].riskWeight = newRiskWeight;
        emit MarkerUpdated(diseaseId, newRiskWeight);
    }

    function toggleDiseaseMarker(uint8 diseaseId) external onlyOwner {
        require(diseaseId >= 1 && diseaseId <= 5, "Invalid disease ID");
        diseaseMarkers[diseaseId].isActive = !diseaseMarkers[diseaseId].isActive;
    }

    function getContractStats() external view returns (
        uint16 totalSubmissions,
        uint256 lastRequestId,
        address contractOwner
    ) {
        return (totalSamples, analysisRequestId, owner);
    }

    function emergencyPause() external onlyOwner {
        for (uint8 i = 1; i <= 5; i++) {
            diseaseMarkers[i].isActive = false;
        }
    }

    function emergencyResume() external onlyOwner {
        for (uint8 i = 1; i <= 5; i++) {
            diseaseMarkers[i].isActive = true;
        }
    }
}