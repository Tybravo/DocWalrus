import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { SuiClient } from '@mysten/sui/client';

// Get site metadata from SUI blockchain
export async function getSiteMetadata(
  metadataId: string,
  endpoint: string = 'https://fullnode.mainnet.sui.io:443'
) {
  console.log(`Getting site metadata for object ID: ${metadataId}...`);
  
  // Initialize SUI client
  const client = new SuiClient({ url: endpoint });
  
  // Get object
  const object = await client.getObject({
    id: metadataId,
    options: {
      showContent: true,
    },
  });
  
  return object;
}

// Get file content from SUI blockchain
export async function getFileContent(
  blobId: string,
  endpoint: string = 'https://fullnode.mainnet.sui.io:443'
) {
  console.log(`Getting file content for blob ID: ${blobId}...`);
  
  // Initialize SUI client
  const client = new SuiClient({ url: endpoint });
  
  // Get object
  const object = await client.getObject({
    id: blobId,
    options: {
      showContent: true,
    },
  });
  
  return object;
}