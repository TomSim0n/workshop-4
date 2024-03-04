import {  webcrypto } from "crypto";


// #############
// ### Utils ###
// #############

// Function to convert ArrayBuffer to Base64 string
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  return Buffer.from(buffer).toString("base64");
}

// Function to convert Base64 string to ArrayBuffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  var buff = Buffer.from(base64, "base64");
  return buff.buffer.slice(buff.byteOffset, buff.byteOffset + buff.byteLength);
}

// ################
// ### RSA keys ###
// ################

// Generates a pair of private / public RSA keys
type GenerateRsaKeyPair = {
  publicKey: webcrypto.CryptoKey;
  privateKey: webcrypto.CryptoKey;
};
export async function generateRsaKeyPair(): Promise<GenerateRsaKeyPair> {
  const keyPair = await webcrypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256",
      },
      true,
      ["encrypt", "decrypt"]
  );
  return keyPair;
}

// Export a crypto public key to a base64 string format
export async function exportPubKey(key: webcrypto.CryptoKey): Promise<string> {
  const exportedKey = await webcrypto.subtle.exportKey("spki", key);

  const base64Key = arrayBufferToBase64(exportedKey);

  return base64Key;
}

// Export a crypto private key to a base64 string format
export async function exportPrvKey(key: webcrypto.CryptoKey | null): Promise<string | null> {
  if (!key) {
    return null;
  }

  try {
    const exportedKey = await webcrypto.subtle.exportKey("pkcs8", key);
    const base64Key = arrayBufferToBase64(exportedKey);
    return base64Key;
  } catch (error) {
    console.error("Error exporting private key:", error);
    return null;
  }
}

// Import a base64 string public key to its native format
export async function importPubKey(
  strKey: string
): Promise<webcrypto.CryptoKey> {
  try {
  
    const keyBuffer = base64ToArrayBuffer(strKey);
    
    const publicKey = await webcrypto.subtle.importKey(
      "spki",
      keyBuffer,
      {
        name: "RSA-OAEP",
        hash: "SHA-256",
      },
      true,
      ["encrypt"]
    );

    return publicKey;
  } catch (error) {
    console.error("Error importing public key:", error);
    throw error;
  }
}

// Import a base64 string private key to its native format
export async function importPrvKey(
  strKey: string
): Promise<webcrypto.CryptoKey> {
  try {
    const keyBuffer = base64ToArrayBuffer(strKey);
    
    const privateKey = await webcrypto.subtle.importKey(
      "pkcs8",
      keyBuffer,
      {
        name: "RSA-OAEP",
        hash: "SHA-256",
      },
      true,
      ["decrypt"]
    );

    return privateKey;
  } catch (error) {
    console.error("Error importing private key:", error);
    throw error;
  }
}

// Encrypt a message using an RSA public key
export async function rsaEncrypt(
  b64Data: string,
  strPublicKey: string
): Promise<string> {
  try {
 

  const data = new TextEncoder().encode(b64Data);
    
   const publicKey = await importPubKey(strPublicKey);
  const encryptedData = await webcrypto.subtle.encrypt(
      {
        name: "RSA-OAEP",
      },
      publicKey,
      data
    );
    const encryptedBase64 = arrayBufferToBase64(encryptedData);

    return encryptedBase64;
  } catch (error) {
    console.error("Error encrypting message:", error);
    throw error;
  
}
}

// Decrypts a message using an RSA private key
export async function rsaDecrypt(
  data: string,
  privateKey: webcrypto.CryptoKey
): Promise<string> {
  try {
  
    const dataBuffer = base64ToArrayBuffer(data);
    
    const decryptedData = await webcrypto.subtle.decrypt(
      {
        name: "RSA-OAEP",
      },
      privateKey,
      dataBuffer
    );

    const decryptedString = new TextDecoder().decode(decryptedData);

    return decryptedString;
  } catch (error) {
    console.error("Error decrypting message:", error);
    throw error;
  }
}

// ######################
// ### Symmetric keys ###
// ######################

// Generates a random symmetric key
export async function createRandomSymmetricKey(): Promise<webcrypto.CryptoKey> {
  try {
  
    const key = await webcrypto.subtle.generateKey(
      {
        name: "AES-CBC",
        length: 256, 
      },
      true, 
      ["encrypt", "decrypt"] 
    );

    return key;
  } catch (error) {
    console.error("Error generating symmetric key:", error);
    throw error;
  }

}

// Export a crypto symmetric key to a base64 string format
export async function exportSymKey(key: webcrypto.CryptoKey): Promise<string> {
  try {
    const exportedKey = await webcrypto.subtle.exportKey("raw", key);
    const base64Key = arrayBufferToBase64(exportedKey);
    return base64Key;
  } catch (error) {
    console.error("Error exporting symmetric key:", error);
    throw error;
  }
}

// Import a base64 string format to its crypto native format
export async function importSymKey(
  strKey: string
): Promise<webcrypto.CryptoKey> {
  try {

    const keyBuffer = base64ToArrayBuffer(strKey);
    
   
    const importedKey = await webcrypto.subtle.importKey(
      "raw",
      keyBuffer,
      { name: "AES-CBC" }, 
      true, 
      ["encrypt", "decrypt"] 
    );

    return importedKey;
  } catch (error) {
    console.error("Error importing symmetric key:", error);
    throw error;
  }
}

// Encrypt a message using a symmetric key
export async function symEncrypt(
  key: webcrypto.CryptoKey,
  data: string
): Promise<string> {
  try {
    const encodedData = new TextEncoder().encode(data);
  
    const iv = crypto.getRandomValues(new Uint8Array(16));
    
    const encryptedData = await webcrypto.subtle.encrypt(
      {
        name: "AES-CBC",
        iv: iv,
      },
      key,
      encodedData
    );
    const encryptedDataWithIV = new Uint8Array(iv.length + encryptedData.byteLength);
    encryptedDataWithIV.set(iv);
    encryptedDataWithIV.set(new Uint8Array(encryptedData), iv.length);
    const encryptedBase64 = arrayBufferToBase64(encryptedDataWithIV);

    return encryptedBase64;
  } catch (error) {
    console.error("Error encrypting message:", error);
    throw error;
  }
}

// Decrypt a message using a symmetric key
export async function symDecrypt(
  strKey: string,
  encryptedData: string
): Promise<string> {
  try {
   
    const key = await importSymKey(strKey); 
    const encryptedDataBuffer = base64ToArrayBuffer(encryptedData);


    const decryptedData = await webcrypto.subtle.decrypt(
      {
        name: "AES-CBC",
        iv: encryptedDataBuffer.slice(0, 16), 
      },
      key,
      encryptedDataBuffer.slice(16)
    );

    const decryptedString = new TextDecoder().decode(decryptedData);

    return decryptedString;
  } catch (error) {
    console.error("Error decrypting message:", error);
    throw error;
  }

}
