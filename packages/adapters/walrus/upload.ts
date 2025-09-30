import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { SuiClient } from '@mysten/sui/client';
import { bcs } from '@mysten/sui/bcs';
import { Transaction } from '@mysten/sui/transactions';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { Readable } from 'stream';

// Define the type for blob entries
interface BlobEntry {
  path: string;
  blobId: string;
}

// Define Walrus service configuration
export interface WalrusServiceConfig {
  publisherUrl: string;
  aggregatorUrl: string;
  epochs?: number;
  deletable?: boolean;
  walletKey?: string;
  walletAddress?: string;
}

// Default Walrus service endpoints (testnet)
const DEFAULT_WALRUS_CONFIG: WalrusServiceConfig = {
  publisherUrl: 'https://publisher.walrus-testnet.walrus.space/v1/store',
  aggregatorUrl: 'https://aggregator.walrus-testnet.walrus.space/v1/api',
  epochs: 1,
  deletable: false
};

// Helper function to get all files in directory recursively
function getAllFiles(dir: string): string[] {
  const files: string[] = [];
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      files.push(...getAllFiles(fullPath));
    } else {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Upload files to Walrus service and get blob IDs
export async function uploadToWalrus(
  buildDir: string,
  privateKey: string,
  config: WalrusServiceConfig = DEFAULT_WALRUS_CONFIG
): Promise<BlobEntry[]> {
  console.log('Uploading files to Walrus service...');
  
  // Create keypair from private key for wallet address
  let keyBytes;
  try {
    // Try base64 first
    const rawBytes = Buffer.from(privateKey, 'base64');
    console.log(`Base64 decoded length: ${rawBytes.length}, first byte: ${rawBytes[0]}`);
    if (rawBytes.length === 33 && rawBytes[0] === 0) {
      // This is a base64-encoded Ed25519 private key with type byte
      keyBytes = rawBytes.slice(1);
      console.log(`Sliced key bytes length: ${keyBytes.length}`);
    } else {
      // Try hex
      console.log(`Trying hex decoding for key: ${privateKey.substring(0, 10)}...`);
      keyBytes = Buffer.from(privateKey, 'hex');
      console.log(`Hex decoded length: ${keyBytes.length}`);
    }
    
    if (keyBytes.length !== 32) {
      throw new Error(`Invalid private key length: ${keyBytes.length} bytes`);
    }
    
    const keypair = Ed25519Keypair.fromSecretKey(keyBytes);
    const walletAddress = keypair.getPublicKey().toSuiAddress();
    
    // Add wallet info to config
    const walrusConfig = {
      ...config,
      walletKey: privateKey,
      walletAddress
    };
  
    // Get all files in build directory
    const files = getAllFiles(buildDir);
    
    // Upload each file to Walrus service
    const blobIds: BlobEntry[] = [];
    
    for (const file of files) {
      const relativePath = path.relative(buildDir, file);
      
      console.log(`Uploading ${relativePath} to Walrus service...`);
      
      try {
        const blobId = await uploadFileToWalrus(file, walrusConfig);
        
        if (blobId) {
          blobIds.push({
            path: relativePath,
            blobId,
          });
          console.log(`✓ Uploaded ${relativePath} -> Blob ID: ${blobId}`);
        } else {
          console.error(`✗ Failed to upload ${relativePath}`);
        }
      } catch (error) {
        console.error(`✗ Error uploading ${relativePath}:`, error);
      }
    }
    
    console.log('Walrus service upload complete!');
    
    return blobIds;
  } catch (error) {
    console.error('Error processing private key:', error);
    throw error;
  }
}

// Upload a single file to Walrus service
async function uploadFileToWalrus(filePath: string, config: WalrusServiceConfig): Promise<string | null> {
  const fileContent = fs.readFileSync(filePath);
  const fileName = path.basename(filePath);
  
  // Build query parameters
  const queryParams = new URLSearchParams();
  if (config.epochs) queryParams.set('epochs', config.epochs.toString());
  if (config.deletable) queryParams.set('deletable', 'true');
  
  const url = `${config.publisherUrl}?${queryParams.toString()}`;
  
  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Length': fileContent.length,
        'X-File-Name': fileName,
        // Add wallet authentication headers for real Walrus service
        'X-Wallet-Address': config.walletAddress || '',
        'Authorization': `Bearer ${config.walletKey}`
      }
    }, (res) => {
      let data = '';
      
      // Log response status for debugging
      console.log(`Walrus service response status: ${res.statusCode}`);
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`Walrus service response data: ${data}`);
        
        if (res.statusCode === 200) {
          try {
            const response = JSON.parse(data);
            // Extract blob ID from response - Walrus returns it in newlyCreated.blobObject.blobId
            const blobId = response.newlyCreated?.blobObject?.blobId;
            if (blobId) {
              resolve(blobId);
            } else {
              console.error('No blob ID found in response:', response);
              resolve(null);
            }
          } catch (error) {
            console.error('JSON parsing error:', error, 'Raw response:', data);
            resolve(data); // Return raw response if JSON parsing fails
          }
        } else {
          console.error(`Walrus service error: Status ${res.statusCode}, Response: ${data}`);
          reject(new Error(`Walrus service returned status ${res.statusCode}: ${data}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    // Send file content
    req.write(fileContent);
    req.end();
  });
}

// Additional utility function to check blob availability
export async function checkBlobAvailability(blobId: string, config: WalrusServiceConfig = DEFAULT_WALRUS_CONFIG): Promise<boolean> {
  try {
    const url = `${config.aggregatorUrl}/blobs/${blobId}`;
    
    return new Promise((resolve, reject) => {
      https.get(url, (res) => {
        resolve(res.statusCode === 200);
      }).on('error', (error) => {
        reject(error);
      });
    });
  } catch (error) {
    console.error('Error checking blob availability:', error);
    return false;
  }
}