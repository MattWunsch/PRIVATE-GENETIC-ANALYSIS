const CONTRACT_ADDRESS = "0xE82c785aBf911c35b01294CB9587d71209118936";
const SEPOLIA_CHAIN_ID = "0xaa36a7";

const CONTRACT_ABI = [
    "function owner() public view returns (address)",
    "function totalSamples() public view returns (uint16)",
    "function analysisRequestId() public view returns (uint256)",
    "function submitGeneticSample(uint8[32] calldata geneData) external",
    "function requestAnalysis() external",
    "function requestResultDecryption() external",
    "function authorizeResearchLab(address lab) external",
    "function revokeLabAuthorization(address lab) external",
    "function getAnalysisStatus(address patient) external view returns (bool sampleSubmitted, bool analysisComplete, bool resultsReady, uint256 submissionTime, uint256 analysisTime)",
    "function getSampleInfo(address patient) external view returns (bool submitted, uint256 timestamp, bool complete)",
    "function getDiseaseMarkerInfo(uint8 diseaseId) external view returns (uint8 riskWeight, bool isActive)",
    "function updateDiseaseMarker(uint8 diseaseId, uint8 newRiskWeight) external",
    "function toggleDiseaseMarker(uint8 diseaseId) external",
    "function getContractStats() external view returns (uint16 totalSubmissions, uint256 lastRequestId, address contractOwner)",
    "function emergencyPause() external",
    "function emergencyResume() external",
    "function authorizedLabs(address) public view returns (bool)",
    "event SampleSubmitted(address indexed patient, uint256 timestamp)",
    "event AnalysisStarted(address indexed patient, uint256 requestId)",
    "event AnalysisComplete(address indexed patient, uint256 timestamp)",
    "event ResultsDecrypted(address indexed patient, uint8 overallRisk)",
    "event LabAuthorized(address indexed lab)",
    "event MarkerUpdated(uint8 diseaseId, uint8 riskWeight)"
];

let provider;
let signer;
let contract;
let userAccount;

// Disease information for DNA analysis
const DISEASES = {
    1: { name: "Cardiovascular Disease", description: "Genetic markers for heart and cardiovascular conditions", risk: "High impact genetic variant" },
    2: { name: "Type 2 Diabetes", description: "DNA markers for insulin resistance and metabolism", risk: "Moderate genetic predisposition" },
    3: { name: "Alzheimer's Disease", description: "Neurological genetic markers and brain health", risk: "Progressive cognitive risk factors" },
    4: { name: "Breast Cancer", description: "BRCA and other breast cancer genetic markers", risk: "Hereditary cancer risk variants" },
    5: { name: "Colon Cancer", description: "Colorectal genetic risk factors and mutations", risk: "Familial cancer predisposition" }
};

// DNA nucleotide mapping
const NUCLEOTIDES = {
    65: 'A', // Adenine
    84: 'T', // Thymine
    67: 'C', // Cytosine
    71: 'G'  // Guanine
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Check if ethers.js loaded successfully
    if (typeof ethers === 'undefined') {
        console.error('ethers.js failed to load from CDN');
        showMessage('Failed to load blockchain library. Please check your internet connection and refresh the page.', 'error');
        return;
    }

    // Ensure connect wallet button is visible
    const connectBtn = document.getElementById('connectWallet');
    if (connectBtn) {
        connectBtn.style.display = 'inline-block';
        console.log('Connect wallet button found and made visible');
    } else {
        console.error('Connect wallet button not found!');
    }

    initializeApp();
});

async function initializeApp() {
    try {
        if (typeof window.ethereum !== 'undefined') {
            provider = new ethers.providers.Web3Provider(window.ethereum);

            // Check if already connected
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                await connectWallet();
            }

            // Listen for account changes
            window.ethereum.on('accountsChanged', function (accounts) {
                if (accounts.length === 0) {
                    disconnectWallet();
                } else {
                    connectWallet();
                }
            });

            // Listen for network changes
            window.ethereum.on('chainChanged', function (chainId) {
                window.location.reload();
            });
        } else {
            showMessage('🦊 MetaMask wallet is required for DNA analysis. Please install MetaMask browser extension.', 'error');

            // Show MetaMask installation guidance
            const welcomeSection = document.getElementById('welcomeSection');
            if (welcomeSection) {
                welcomeSection.innerHTML += `
                    <div class="metamask-notice">
                        <h3>🦊 Install MetaMask Wallet</h3>
                        <p>To use our confidential DNA analysis platform, you need MetaMask:</p>
                        <ol>
                            <li>Visit <a href="https://metamask.io" target="_blank">metamask.io</a></li>
                            <li>Install the browser extension</li>
                            <li>Create or import a wallet</li>
                            <li>Refresh this page</li>
                        </ol>
                    </div>
                `;
            }
        }
    } catch (error) {
        console.error('Initialization error:', error);
        showMessage('Failed to initialize application: ' + error.message, 'error');
    }
}

async function connectWallet() {
    try {
        showLoading(true);

        await window.ethereum.request({ method: 'eth_requestAccounts' });

        // Check if on correct network
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        if (chainId !== SEPOLIA_CHAIN_ID) {
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: SEPOLIA_CHAIN_ID }],
                });
            } catch (switchError) {
                if (switchError.code === 4902) {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: SEPOLIA_CHAIN_ID,
                            chainName: 'Sepolia Test Network',
                            nativeCurrency: {
                                name: 'SepoliaETH',
                                symbol: 'ETH',
                                decimals: 18
                            },
                            rpcUrls: ['https://sepolia.infura.io/v3/'],
                            blockExplorerUrls: ['https://sepolia.etherscan.io/']
                        }]
                    });
                }
            }
        }

        signer = provider.getSigner();
        userAccount = await signer.getAddress();

        if (CONTRACT_ADDRESS && CONTRACT_ADDRESS !== "0x...") {
            contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        }

        updateConnectionStatus(true);
        showDashboard();

        showMessage('Wallet connected successfully!', 'success');

    } catch (error) {
        console.error('Connection error:', error);
        showMessage('Failed to connect wallet: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

function disconnectWallet() {
    provider = null;
    signer = null;
    contract = null;
    userAccount = null;

    updateConnectionStatus(false);
    showWelcomeSection();
}

function updateConnectionStatus(connected) {
    const statusIndicator = document.querySelector('.status-indicator');
    const statusText = document.querySelector('.status-text');
    const walletAddress = document.getElementById('walletAddress');

    if (connected) {
        statusIndicator.classList.add('connected');
        statusText.textContent = 'Connected';
        if (walletAddress && userAccount) {
            walletAddress.textContent = `${userAccount.slice(0, 6)}...${userAccount.slice(-4)}`;
        }
    } else {
        statusIndicator.classList.remove('connected');
        statusText.textContent = 'Not Connected';
        if (walletAddress) {
            walletAddress.textContent = '';
        }
    }
}

function showWelcomeSection() {
    document.getElementById('welcomeSection').style.display = 'block';
    document.getElementById('dashboard').style.display = 'none';
}

function showDashboard() {
    document.getElementById('welcomeSection').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
}

function switchTab(tabName) {
    // Remove active class from all tabs and content
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    // Add active class to selected tab and content
    event.target.classList.add('active');
    document.getElementById(tabName + 'Tab').classList.add('active');
}

function showLoading(show) {
    document.getElementById('loadingOverlay').style.display = show ? 'flex' : 'none';
}

function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `${type}-message`;
    messageDiv.textContent = message;

    const container = document.querySelector('.main-content');
    container.insertBefore(messageDiv, container.firstChild);

    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

// DNA Testing Functions
function generateRandomSequence() {
    const nucleotides = [65, 84, 67, 71]; // A, T, C, G
    const sequence = [];

    for (let i = 0; i < 32; i++) {
        sequence.push(nucleotides[Math.floor(Math.random() * nucleotides.length)]);
    }

    const sequenceString = sequence.join(',');
    document.getElementById('geneSequenceInput').value = sequenceString;

    // Update DNA visualization
    updateDNAVisualization(sequence);

    showMessage('Random DNA test sequence generated successfully!', 'success');
}

function validateSequence() {
    const sequenceInput = document.getElementById('geneSequenceInput').value.trim();

    if (!sequenceInput) {
        showMessage('Please enter a DNA sequence first', 'error');
        return false;
    }

    try {
        const sequence = sequenceInput.split(',').map(num => parseInt(num.trim()));

        if (sequence.length !== 32) {
            showMessage('DNA sequence must contain exactly 32 nucleotides', 'error');
            return false;
        }

        const validNucleotides = [65, 84, 67, 71]; // A, T, C, G
        const invalidCount = sequence.filter(val => !validNucleotides.includes(val)).length;

        if (invalidCount > 0) {
            showMessage(`Invalid nucleotides detected! Use only: A=65, T=84, G=71, C=67`, 'error');
            return false;
        }

        // Update DNA visualization
        updateDNAVisualization(sequence);

        // Show sequence statistics
        const stats = calculateSequenceStats(sequence);
        showMessage(`✓ Valid DNA sequence: ${stats.a}A, ${stats.t}T, ${stats.g}G, ${stats.c}C`, 'success');

        return true;
    } catch (error) {
        showMessage('Invalid sequence format. Use comma-separated numbers.', 'error');
        return false;
    }
}

function updateDNAVisualization(sequence) {
    const visualization = document.getElementById('dnaVisualization');
    if (!visualization || !sequence) return;

    const dnaString = sequence.map(code => NUCLEOTIDES[code] || '?').join('');
    const formattedDNA = dnaString.match(/.{1,8}/g).join(' ');

    visualization.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: 600;">DNA Sequence:</span>
            <span style="font-size: 0.8rem; color: #64748b;">${sequence.length}/32 nucleotides</span>
        </div>
        <div style="margin-top: 8px; letter-spacing: 2px; line-height: 1.6;">
            ${formattedDNA}
        </div>
    `;
}

function calculateSequenceStats(sequence) {
    const stats = { a: 0, t: 0, g: 0, c: 0 };
    sequence.forEach(code => {
        switch(code) {
            case 65: stats.a++; break;
            case 84: stats.t++; break;
            case 71: stats.g++; break;
            case 67: stats.c++; break;
        }
    });
    return stats;
}

async function submitGeneticSample() {
    if (!contract) {
        showMessage('Contract not initialized. Please update CONTRACT_ADDRESS.', 'error');
        return;
    }

    // Validate sequence first
    if (!validateSequence()) {
        return;
    }

    try {
        showLoading(true);

        const sequenceInput = document.getElementById('geneSequenceInput').value.trim();
        const sequence = sequenceInput.split(',').map(num => parseInt(num.trim()));

        // Additional validation for DNA submission
        const validNucleotides = [65, 84, 67, 71];
        if (sequence.some(val => !validNucleotides.includes(val))) {
            throw new Error('Invalid DNA sequence. Use only A=65, T=84, G=71, C=67');
        }

        const tx = await contract.submitGeneticSample(sequence);
        await tx.wait();

        // Clear the input and visualization after successful submission
        document.getElementById('geneSequenceInput').value = '';
        document.getElementById('dnaVisualization').innerHTML = '';

        showMessage('🧬 DNA sample submitted securely! Your genetic data is now encrypted on-chain.', 'success');

        // Update status immediately
        setTimeout(() => {
            checkSampleStatus();
        }, 2000);

    } catch (error) {
        console.error('Submit DNA sample error:', error);
        if (error.message.includes('Sample already submitted')) {
            showMessage('You have already submitted a DNA sample. Each wallet can only submit one sample.', 'error');
        } else {
            showMessage('Failed to submit DNA sample: ' + error.message, 'error');
        }
    } finally {
        showLoading(false);
    }
}

async function requestAnalysis() {
    if (!contract) {
        showMessage('Contract not initialized. Please update CONTRACT_ADDRESS.', 'error');
        return;
    }

    try {
        showLoading(true);

        const tx = await contract.requestAnalysis();
        await tx.wait();

        showMessage('🔬 Confidential DNA analysis started! Your genetic data is being analyzed securely using FHE encryption.', 'success');

        // Update the results section to show analysis in progress
        const resultsContainer = document.getElementById('analysisResults');
        resultsContainer.innerHTML = `
            <div class="analysis-progress">
                <div class="progress-icon">🧪</div>
                <div class="progress-text">
                    <h4>Analysis in Progress</h4>
                    <p>Your DNA is being analyzed against 5 disease markers...</p>
                    <div class="progress-bar">
                        <div class="progress-fill"></div>
                    </div>
                </div>
            </div>
        `;

        setTimeout(() => {
            checkSampleStatus();
        }, 2000);

    } catch (error) {
        console.error('Request analysis error:', error);
        if (error.message.includes('No sample submitted')) {
            showMessage('Please submit your DNA sample first before requesting analysis.', 'error');
        } else if (error.message.includes('Analysis already complete')) {
            showMessage('Analysis is already complete. You can decrypt your results now.', 'info');
        } else {
            showMessage('Failed to start analysis: ' + error.message, 'error');
        }
    } finally {
        showLoading(false);
    }
}

async function requestResultDecryption() {
    if (!contract) {
        showMessage('Contract not initialized. Please update CONTRACT_ADDRESS.', 'error');
        return;
    }

    try {
        showLoading(true);

        const tx = await contract.requestResultDecryption();
        await tx.wait();

        showMessage('Result decryption requested successfully!', 'success');

        // Listen for decryption event
        contract.on("ResultsDecrypted", (patient, overallRisk) => {
            if (patient.toLowerCase() === userAccount.toLowerCase()) {
                displayAnalysisResults(overallRisk);
            }
        });

    } catch (error) {
        console.error('Request decryption error:', error);
        showMessage('Failed to request decryption: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

function displayAnalysisResults(overallRisk) {
    const resultsContainer = document.getElementById('analysisResults');

    let riskClass = 'risk-low';
    if (overallRisk > 60) riskClass = 'risk-high';
    else if (overallRisk > 30) riskClass = 'risk-medium';

    resultsContainer.innerHTML = `
        <h4>Analysis Results</h4>
        <div class="risk-score ${riskClass}">
            Overall Risk Score: ${overallRisk}%
        </div>
        <p>Risk Level: ${riskClass.replace('risk-', '').toUpperCase()}</p>
        <div class="info-message">
            Results are based on genetic markers analysis. Consult with healthcare professionals for medical advice.
        </div>
    `;
}

async function checkSampleStatus() {
    if (!contract || !userAccount) return;

    try {
        const status = await contract.getAnalysisStatus(userAccount);
        const sampleInfo = await contract.getSampleInfo(userAccount);

        const statusContainer = document.getElementById('sampleStatus');
        statusContainer.innerHTML = `
            <h4>Sample Status</h4>
            <div class="marker-info">
                <span>Sample Submitted: ${status.sampleSubmitted ? 'Yes' : 'No'}</span>
                <span>Analysis Complete: ${status.analysisComplete ? 'Yes' : 'No'}</span>
                <span>Results Ready: ${status.resultsReady ? 'Yes' : 'No'}</span>
            </div>
            ${status.sampleSubmitted ? `
                <p>Submission Time: ${new Date(sampleInfo.timestamp * 1000).toLocaleString()}</p>
            ` : ''}
            ${status.analysisTime > 0 ? `
                <p>Analysis Time: ${new Date(status.analysisTime * 1000).toLocaleString()}</p>
            ` : ''}
        `;

    } catch (error) {
        console.error('Check status error:', error);
        showMessage('Failed to check status: ' + error.message, 'error');
    }
}

// Lab Functions
async function loadDiseaseMarkers() {
    if (!contract) {
        showMessage('Contract not initialized. Please update CONTRACT_ADDRESS.', 'error');
        return;
    }

    try {
        const markersContainer = document.getElementById('diseaseMarkers');
        markersContainer.innerHTML = '<h4>Disease Markers</h4>';

        for (let i = 1; i <= 5; i++) {
            const marker = await contract.getDiseaseMarkerInfo(i);
            const disease = DISEASES[i];

            const markerDiv = document.createElement('div');
            markerDiv.className = 'disease-marker';
            markerDiv.innerHTML = `
                <h4>Disease ${i}: ${disease.name}</h4>
                <p>${disease.description}</p>
                <div class="marker-info">
                    <span>Risk Weight: ${marker.riskWeight}%</span>
                    <span>Status: ${marker.isActive ? 'Active' : 'Inactive'}</span>
                </div>
            `;

            markersContainer.appendChild(markerDiv);
        }

    } catch (error) {
        console.error('Load markers error:', error);
        showMessage('Failed to load markers: ' + error.message, 'error');
    }
}

async function checkPatientStatus() {
    if (!contract) {
        showMessage('Contract not initialized. Please update CONTRACT_ADDRESS.', 'error');
        return;
    }

    try {
        const patientAddress = document.getElementById('patientAddressInput').value.trim();
        if (!ethers.utils.isAddress(patientAddress)) {
            throw new Error('Invalid patient address');
        }

        const status = await contract.getAnalysisStatus(patientAddress);
        const sampleInfo = await contract.getSampleInfo(patientAddress);

        const resultsDiv = document.getElementById('patientStatusResults');
        resultsDiv.innerHTML = `
            <h4>Patient Status: ${patientAddress.slice(0, 6)}...${patientAddress.slice(-4)}</h4>
            <div class="marker-info">
                <span>Sample Submitted: ${status.sampleSubmitted ? 'Yes' : 'No'}</span>
                <span>Analysis Complete: ${status.analysisComplete ? 'Yes' : 'No'}</span>
                <span>Results Ready: ${status.resultsReady ? 'Yes' : 'No'}</span>
            </div>
            ${status.sampleSubmitted ? `
                <p>Submission Time: ${new Date(sampleInfo.timestamp * 1000).toLocaleString()}</p>
            ` : ''}
        `;

    } catch (error) {
        console.error('Check patient status error:', error);
        showMessage('Failed to check patient status: ' + error.message, 'error');
    }
}

// Admin Functions
async function authorizeResearchLab() {
    if (!contract) {
        showMessage('Contract not initialized. Please update CONTRACT_ADDRESS.', 'error');
        return;
    }

    try {
        showLoading(true);

        const labAddress = document.getElementById('labAddressInput').value.trim();
        if (!ethers.utils.isAddress(labAddress)) {
            throw new Error('Invalid lab address');
        }

        const tx = await contract.authorizeResearchLab(labAddress);
        await tx.wait();

        showMessage('Lab authorized successfully!', 'success');

    } catch (error) {
        console.error('Authorize lab error:', error);
        showMessage('Failed to authorize lab: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

async function revokeLabAuthorization() {
    if (!contract) {
        showMessage('Contract not initialized. Please update CONTRACT_ADDRESS.', 'error');
        return;
    }

    try {
        showLoading(true);

        const labAddress = document.getElementById('labAddressInput').value.trim();
        if (!ethers.utils.isAddress(labAddress)) {
            throw new Error('Invalid lab address');
        }

        const tx = await contract.revokeLabAuthorization(labAddress);
        await tx.wait();

        showMessage('Lab authorization revoked successfully!', 'success');

    } catch (error) {
        console.error('Revoke lab error:', error);
        showMessage('Failed to revoke lab authorization: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

async function updateDiseaseMarker() {
    if (!contract) {
        showMessage('Contract not initialized. Please update CONTRACT_ADDRESS.', 'error');
        return;
    }

    try {
        showLoading(true);

        const diseaseId = parseInt(document.getElementById('diseaseIdInput').value);
        const riskWeight = parseInt(document.getElementById('riskWeightInput').value);

        if (diseaseId < 1 || diseaseId > 5) {
            throw new Error('Disease ID must be between 1 and 5');
        }

        if (riskWeight < 0 || riskWeight > 100) {
            throw new Error('Risk weight must be between 0 and 100');
        }

        const tx = await contract.updateDiseaseMarker(diseaseId, riskWeight);
        await tx.wait();

        showMessage('Disease marker updated successfully!', 'success');
        loadDiseaseMarkers();

    } catch (error) {
        console.error('Update marker error:', error);
        showMessage('Failed to update marker: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

async function toggleDiseaseMarker() {
    if (!contract) {
        showMessage('Contract not initialized. Please update CONTRACT_ADDRESS.', 'error');
        return;
    }

    try {
        showLoading(true);

        const diseaseId = parseInt(document.getElementById('diseaseIdInput').value);

        if (diseaseId < 1 || diseaseId > 5) {
            throw new Error('Disease ID must be between 1 and 5');
        }

        const tx = await contract.toggleDiseaseMarker(diseaseId);
        await tx.wait();

        showMessage('Disease marker toggled successfully!', 'success');
        loadDiseaseMarkers();

    } catch (error) {
        console.error('Toggle marker error:', error);
        showMessage('Failed to toggle marker: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

async function loadContractStats() {
    if (!contract) {
        showMessage('Contract not initialized. Please update CONTRACT_ADDRESS.', 'error');
        return;
    }

    try {
        const stats = await contract.getContractStats();

        const statsContainer = document.getElementById('contractStats');
        statsContainer.innerHTML = `
            <h4>Contract Statistics</h4>
            <div class="marker-info">
                <span>Total Samples: ${stats.totalSubmissions}</span>
                <span>Last Request ID: ${stats.lastRequestId.toString()}</span>
                <span>Owner: ${stats.contractOwner.slice(0, 6)}...${stats.contractOwner.slice(-4)}</span>
            </div>
        `;

    } catch (error) {
        console.error('Load stats error:', error);
        showMessage('Failed to load stats: ' + error.message, 'error');
    }
}

async function emergencyPause() {
    if (!contract) {
        showMessage('Contract not initialized. Please update CONTRACT_ADDRESS.', 'error');
        return;
    }

    try {
        showLoading(true);

        const tx = await contract.emergencyPause();
        await tx.wait();

        showMessage('Emergency pause activated!', 'success');
        loadDiseaseMarkers();

    } catch (error) {
        console.error('Emergency pause error:', error);
        showMessage('Failed to activate emergency pause: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

async function emergencyResume() {
    if (!contract) {
        showMessage('Contract not initialized. Please update CONTRACT_ADDRESS.', 'error');
        return;
    }

    try {
        showLoading(true);

        const tx = await contract.emergencyResume();
        await tx.wait();

        showMessage('Emergency resume activated!', 'success');
        loadDiseaseMarkers();

    } catch (error) {
        console.error('Emergency resume error:', error);
        showMessage('Failed to activate emergency resume: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// Event Listeners
document.getElementById('connectWallet').addEventListener('click', connectWallet);