// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint8, euint16, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title Template Contract
 * @notice This is a template contract demonstrating FHEVM concepts.
 * @dev Replace this with your own contract implementation.
 */
contract Template is SepoliaConfig {

    /// @notice Encrypted value stored on-chain
    euint8 private encryptedValue;

    /// @notice Event emitted when value is stored
    event ValueStored(address indexed user, uint256 timestamp);

    /**
     * @notice Store an encrypted value
     * @param value The plaintext value to encrypt and store
     */
    function storeValue(uint8 value) external {
        // Encrypt the value
        euint8 encrypted = FHE.asEuint8(value);

        // Grant contract permission to operate on encrypted value
        FHE.allowThis(encrypted);

        // Grant user permission to decrypt the value
        FHE.allow(encrypted, msg.sender);

        // Store encrypted value
        encryptedValue = encrypted;

        emit ValueStored(msg.sender, block.timestamp);
    }

    /**
     * @notice Get the encrypted value
     * @return The encrypted value (as a handle)
     */
    function getEncryptedValue() external view returns (euint8) {
        return encryptedValue;
    }
}
