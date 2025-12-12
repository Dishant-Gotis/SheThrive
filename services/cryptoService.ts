
// Simulates Client-Side Encryption
// In a production app, this would use Web Crypto API (AES-GCM)

export const cryptoService = {
  // Simulate encrypting data with a user-specific key
  encrypt: async (text: string, userId: string): Promise<string> => {
    // Mock: Simple obfuscation for demo purposes (Base64 + User Salt)
    // Real implementation: window.crypto.subtle.encrypt(...)
    const salt = userId.substring(0, 4);
    const payload = encodeURIComponent(text);
    return btoa(`${salt}::${payload}`);
  },

  // Simulate decrypting data
  decrypt: async (cipherText: string, userId: string): Promise<string> => {
    try {
      const decoded = atob(cipherText);
      const [salt, payload] = decoded.split('::');
      
      // Verify key ownership
      if (salt !== userId.substring(0, 4)) {
        return "Encrypted Content (Key Mismatch)";
      }
      
      return decodeURIComponent(payload);
    } catch (e) {
      console.error("Decryption failed", e);
      return "Error decrypting content";
    }
  }
};
