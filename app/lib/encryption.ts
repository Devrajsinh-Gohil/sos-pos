import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// Path to store a persistent encryption key
const KEY_FILE_PATH = path.join(process.cwd(), '.encryption_key');

// Get or create a persistent encryption key
function getEncryptionKey(): string {
  // Priority 1: Use environment variable if available (recommended for production)
  if (process.env.ENCRYPTION_KEY) {
    return process.env.ENCRYPTION_KEY;
  }
  
  try {
    // Priority 2: Try to read from key file
    if (fs.existsSync(KEY_FILE_PATH)) {
      const key = fs.readFileSync(KEY_FILE_PATH, 'utf-8');
      if (key && key.length >= 32) {
        return key;
      }
    }
    
    // Priority 3: Generate a new key and save it
    const newKey = crypto.randomBytes(32).toString('hex');
    try {
      fs.writeFileSync(KEY_FILE_PATH, newKey, { mode: 0o600 }); // Read/write for owner only
    } catch (err) {
      console.warn('Failed to write encryption key to file. Encryption key will not persist between restarts:', err);
    }
    return newKey;
  } catch (error) {
    console.error('Error while getting encryption key:', error);
    // Last resort fallback (not ideal but better than crashing)
    return 'fallback_encryption_key_please_set_env_variable_encryption_key';
  }
}

// Get the encryption key
const ENCRYPTION_KEY = getEncryptionKey();
console.log(`Using encryption key (first 8 chars): ${ENCRYPTION_KEY.substring(0, 8)}...`);

// Initialization vector length
const IV_LENGTH = 16;

/**
 * Encrypts data using AES-256-CBC
 * 
 * @param data - String data to encrypt
 * @returns Encrypted data as base64 string with IV prepended
 */
export function encryptData(data: string): string {
  try {
    // Create initialization vector
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // Create cipher using key and iv
    const cipher = crypto.createCipheriv(
      'aes-256-cbc', 
      Buffer.from(ENCRYPTION_KEY.slice(0, 32), 'utf-8'), 
      iv
    );
    
    // Encrypt the data
    let encrypted = cipher.update(data, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    // Prepend IV to encrypted data and return as base64
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('Error encrypting data:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypts data that was encrypted with encryptData
 * 
 * @param encryptedData - Encrypted data with IV prepended
 * @returns Original decrypted string
 */
export function decryptData(encryptedData: string): string {
  try {
    // Split IV and encrypted data
    const parts = encryptedData.split(':');
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted data format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    
    // Create decipher using key and iv
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc', 
      Buffer.from(ENCRYPTION_KEY.slice(0, 32), 'utf-8'), 
      iv
    );
    
    // Decrypt the data
    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Error decrypting data:', error);
    // Include more diagnostic information in development mode
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? `Failed to decrypt data: ${(error as Error).message || 'Unknown error'}. This could be due to an encryption key change.`
      : 'Failed to decrypt data';
    throw new Error(errorMessage);
  }
} 