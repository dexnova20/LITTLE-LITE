import CryptoJS from 'react-native-crypto-js';
import * as Crypto from 'expo-crypto';

export class CryptoService {
  static async generateKeyPair() {
    // Generate identity key pair
    const identityKey = await this.generateRandomKey();
    const preKey = await this.generateRandomKey();
    const signedPreKey = await this.generateRandomKey();
    
    return {
      identityKey,
      preKey,
      signedPreKey,
      oneTimeKeys: await this.generateOneTimeKeys(10)
    };
  }

  static async generateRandomKey() {
    const randomBytes = await Crypto.getRandomBytesAsync(32);
    return Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  static async generateOneTimeKeys(count) {
    const keys = [];
    for (let i = 0; i < count; i++) {
      keys.push(await this.generateRandomKey());
    }
    return keys;
  }

  static async deriveSharedSecret(privateKey, publicKey) {
    // Simplified ECDH key derivation
    const combined = privateKey + publicKey;
    const hash = CryptoJS.SHA256(combined).toString();
    return hash;
  }

  static async encryptMessage(message, sharedSecret) {
    try {
      // Generate random IV
      const iv = CryptoJS.lib.WordArray.random(16);
      
      // Encrypt message
      const encrypted = CryptoJS.AES.encrypt(message, sharedSecret, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });

      return {
        ciphertext: encrypted.toString(),
        iv: iv.toString(),
        timestamp: Date.now()
      };
    } catch (error) {
      throw new Error('Encryption failed');
    }
  }

  static async decryptMessage(encryptedData, sharedSecret) {
    try {
      const { ciphertext, iv } = encryptedData;
      
      const decrypted = CryptoJS.AES.decrypt(ciphertext, sharedSecret, {
        iv: CryptoJS.enc.Hex.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });

      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      throw new Error('Decryption failed');
    }
  }

  static async establishSession(myKeys, theirPublicKeys) {
    // Simplified Signal Protocol session establishment
    const sharedSecrets = [];
    
    // DH1: Identity key agreement
    sharedSecrets.push(await this.deriveSharedSecret(myKeys.identityKey, theirPublicKeys.identityKey));
    
    // DH2: Ephemeral key agreement
    sharedSecrets.push(await this.deriveSharedSecret(myKeys.preKey, theirPublicKeys.preKey));
    
    // DH3: Signed pre-key agreement
    sharedSecrets.push(await this.deriveSharedSecret(myKeys.signedPreKey, theirPublicKeys.signedPreKey));
    
    // Combine all shared secrets
    const masterSecret = CryptoJS.SHA256(sharedSecrets.join('')).toString();
    
    return {
      rootKey: masterSecret,
      chainKey: CryptoJS.SHA256(masterSecret + 'chain').toString(),
      messageKey: CryptoJS.SHA256(masterSecret + 'message').toString()
    };
  }

  static async rotateKeys(session) {
    // Key rotation for forward secrecy
    const newChainKey = CryptoJS.SHA256(session.chainKey + 'rotate').toString();
    const newMessageKey = CryptoJS.SHA256(newChainKey + 'message').toString();
    
    return {
      ...session,
      chainKey: newChainKey,
      messageKey: newMessageKey
    };
  }

  static generateMessageId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  // Group encryption methods
  static async generateGroupKey() {
    return await this.generateRandomKey();
  }

  static async encryptGroupMessage(message, groupKey) {
    try {
      const iv = CryptoJS.lib.WordArray.random(16);
      
      const encrypted = CryptoJS.AES.encrypt(message, groupKey, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });

      return {
        ciphertext: encrypted.toString(),
        iv: iv.toString(),
        timestamp: Date.now()
      };
    } catch (error) {
      throw new Error('Group encryption failed');
    }
  }

  static async decryptGroupMessage(encryptedData, groupKey) {
    try {
      const { ciphertext, iv } = encryptedData;
      
      const decrypted = CryptoJS.AES.decrypt(ciphertext, groupKey, {
        iv: CryptoJS.enc.Hex.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });

      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      throw new Error('Group decryption failed');
    }
  }
}