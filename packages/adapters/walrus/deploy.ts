import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';

// Deploy site metadata to SUI blockchain with Walrus blob references
export async function deploy(
  siteMetadata: {
    name: string;
    description: string;
    files: { path: string; blobId: string }[];
  },
  privateKey: string,
  endpoint: string = 'https://fullnode.mainnet.sui.io:443'
) {
  console.log('Deploying site metadata to SUI blockchain with Walrus blob references...');
  
  // Initialize SUI client
  const client = new SuiClient({ url: endpoint });
  
  // Create keypair from private key
  let keyBytes;
  // Try base64 first
  const rawBytes = Buffer.from(privateKey, 'base64');
  if (rawBytes.length === 33 && rawBytes[0] === 0) {
    // This is a base64-encoded Ed25519 private key with type byte
    keyBytes = rawBytes.slice(1);
  } else {
    // Try hex
    keyBytes = Buffer.from(privateKey, 'hex');
  }
  
  if (keyBytes.length !== 32) {
    throw new Error(`Invalid private key length: ${keyBytes.length} bytes`);
  }
  
  const keypair = Ed25519Keypair.fromSecretKey(keyBytes);
  
  // Create transaction block
  const tx = new Transaction();
  
  // Create site metadata object with Walrus blob references
  const [metadata] = tx.moveCall({
    target: '0x2::object_bag::new',
    arguments: [
      tx.pure.string(siteMetadata.name),
      tx.pure.string(siteMetadata.description),
      tx.pure.string(JSON.stringify({
        files: siteMetadata.files,
        storageProvider: 'walrus',
        timestamp: new Date().toISOString()
      })),
    ],
  });
  
  // Execute transaction
  const result = await client.signAndExecuteTransaction({
    signer: keypair,
    transaction: tx,
  });
  
  // Get metadata object ID
  const metadataId = result.effects?.created?.[0]?.reference?.objectId;
  
  console.log('Deployment complete!');
  console.log(`Site metadata object ID: ${metadataId}`);
  console.log(`Files stored on Walrus service with blob IDs:`);
  siteMetadata.files.forEach(file => {
    console.log(`  - ${file.path}: ${file.blobId}`);
  });
  
  return metadataId;
}

// Helper function to create site metadata from build directory and blob entries
export function createSiteMetadata(
  name: string,
  description: string,
  blobEntries: { path: string; blobId: string }[]
) {
  return {
    name,
    description,
    files: blobEntries
  };
}