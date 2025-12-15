/**
 * Data Encryption Utilities
 * For encrypting sensitive patient data
 */

const CryptoJS = require('crypto-js');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-in-production';

/**
 * Encrypt sensitive data
 * @param {String} text - Text to encrypt
 * @returns {String} - Encrypted text
 */
function encrypt(text) {
    if (!text) return null;

    try {
        const encrypted = CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
        return encrypted;
    } catch (error) {
        throw new Error('Encryption failed');
    }
}

/**
 * Decrypt encrypted data
 * @param {String} encryptedText - Encrypted text
 * @returns {String} - Decrypted text
 */
function decrypt(encryptedText) {
    if (!encryptedText) return null;

    try {
        const bytes = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        return decrypted;
    } catch (error) {
        throw new Error('Decryption failed');
    }
}

/**
 * Hash data (one-way)
 * @param {String} text - Text to hash
 * @returns {String} - Hashed text
 */
function hash(text) {
    if (!text) return null;

    return CryptoJS.SHA256(text).toString();
}

module.exports = {
    encrypt,
    decrypt,
    hash,
};
