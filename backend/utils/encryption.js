// =============================================
// ENCRYPTION UTILITY FOR CREDENTIALS
// =============================================

import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
let warnedAboutEncryptionKey = false;

// Ensure encryption key is exactly 32 bytes for aes-256
const getEncryptionKey = () => {
  const encryptionKey =
    process.env.ENCRYPTION_KEY ||
    process.env.JWT_SECRET ||
    'rise-with-media-development-credential-key';

  if (!process.env.ENCRYPTION_KEY && !warnedAboutEncryptionKey) {
    console.warn(
      'ENCRYPTION_KEY is not set. Set a persistent 32-byte secret before storing production credentials.'
    );
    warnedAboutEncryptionKey = true;
  }

  return encryptionKey.length === 64
    ? Buffer.from(encryptionKey, 'hex')
    : crypto.scryptSync(encryptionKey, 'salt', 32);
};

/**
 * Encrypt sensitive data
 * @param {string} text - Text to encrypt
 * @returns {string} - Encrypted text in format: iv:encryptedData (both in hex)
 */
export const encryptData = (text) => {
  if (!text) return '';
  
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Return IV and encrypted data separated by colon
    return `${iv.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
};

/**
 * Decrypt sensitive data
 * @param {string} encryptedText - Encrypted text in format: iv:encryptedData
 * @returns {string} - Decrypted text
 */
export const decryptData = (encryptedText) => {
  if (!encryptedText) return '';
  
  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted data format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    
    const decipher = crypto.createDecipheriv(ALGORITHM, getEncryptionKey(), iv);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
};
