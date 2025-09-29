import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

// Get the directory name
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read config file
const config = await import('./docwalrus.config.js');

// Check if private key is provided
const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
  console.error('Error: PRIVATE_KEY environment variable is required');
  process.exit(1);
}

// Get endpoint from command line args or use default
const args = process.argv.slice(2);
let endpoint = 'https://fullnode.testnet.sui.io:443';
const endpointIndex = args.indexOf('-e');
if (endpointIndex !== -1 && args.length > endpointIndex + 1) {
  endpoint = args[endpointIndex + 1];
}

// Build directory path
const buildDir = path.join(__dirname, 'build');

// Check if build directory exists
if (!fs.existsSync(buildDir)) {
  console.error('Error: build directory not found. Please run "pnpm build" and copy the dist folder to build first.');
  process.exit(1);
}

// Helper function to get all files in directory recursively
function getAllFiles(dir) {
  const files = [];
  
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

// Function to upload a file
async function uploadFile(client, keypair, filePath, relativePath) {
  try {
    const stats = fs.statSync(filePath);
    const fileSize = stats.size;
    
    // Skip files larger than 16KB for now (Sui pure argument size limit)
    if (fileSize > 16 * 1024) {
      console.log(`Skipping ${relativePath} (${fileSize} bytes) - file too large for pure argument`);
      return null;
    }
    
    const fileContent = fs.readFileSync(filePath);
    console.log(`Uploading ${relativePath} (${fileContent.length} bytes)...`);
    
    const tx = new TransactionBlock();
    
    // Create a simple object with the file content as a string
    // We'll use a simple approach with object::new and transfer::share_object
    const [fileObject] = tx.moveCall({
      target: '0x2::object::new',
      arguments: [tx.pure(Array.from(fileContent))],
    });
    
    // Make the object shared
    tx.moveCall({
      target: '0x2::transfer::share_object',
      arguments: [fileObject],
    });
    
    const result = await client.signAndExecuteTransactionBlock({
      signer: keypair,
      transactionBlock: tx,
      options: {
        showEffects: true,
        showObjectChanges: true,
      }
    });
    
    const objectId = result.objectChanges?.find(change => 
      change.type === 'created' && change.objectType === '0x2::object::Object'
    )?.objectId;
    
    if (objectId) {
      console.log(`Successfully uploaded ${relativePath} with ID: ${objectId}`);
      return {
        path: relativePath,
        objectId
      };
    } else {
      console.error(`Failed to get object ID for ${relativePath}`);
      console.error('Full result:', JSON.stringify(result, null, 2));
      return null;
    }
  } catch (error) {
    console.error(`Error uploading ${relativePath}:`, error.message);
    if (error.cause) {
      console.error('Cause:', JSON.stringify(error.cause, null, 2));
    }
    return null;
  }
}

async function deployToWalrus() {
  try {
    console.log('Uploading files to SUI blockchain...');
    
    // Initialize SUI client
    const client = new SuiClient({ url: endpoint });
    
    // Create keypair from private key
    const keypair = Ed25519Keypair.fromSecretKey(Buffer.from(privateKey, 'hex'));
    
    // Get all files in build directory
    const files = getAllFiles(buildDir);
    
    // Upload each file
    const fileEntries = [];
    
    for (const file of files) {
      const relativePath = path.relative(buildDir, file).replace(/\\/g, '/');
      const entry = await uploadFile(client, keypair, file, relativePath);
      if (entry) {
        fileEntries.push(entry);
      } else {
        console.log(`Skipping ${relativePath} (file too large or upload failed)`);
        // Continue with other files instead of stopping
      }
    }
    
    console.log('Upload complete!');
    console.log(`Uploaded ${fileEntries.length} files`);
    
    if (fileEntries.length === 0) {
      console.error('No files were successfully uploaded. Deployment failed.');
      return;
    }
    
    // Deploy site metadata
    console.log('Deploying site metadata to SUI blockchain...');
    
    // Create transaction block for metadata
    const metadataTx = new TransactionBlock();
    
    // Create a simple object with the site metadata
    const siteMetadata = {
      title: config.default.title || 'DocWalrus Site',
      tagline: config.default.tagline || 'A site built with DocWalrus',
      files: fileEntries
    };
    
    const metadataString = JSON.stringify(siteMetadata);
    const metadataBuffer = Buffer.from(metadataString, 'utf8');
    
    const [metadata] = metadataTx.moveCall({
      target: '0x2::object::new',
      arguments: [metadataTx.pure(Array.from(metadataBuffer))],
    });
    
    // Make the metadata object shared
    metadataTx.moveCall({
      target: '0x2::transfer::share_object',
      arguments: [metadata],
    });
    
    const metadataResult = await client.signAndExecuteTransactionBlock({
      signer: keypair,
      transactionBlock: metadataTx,
      options: {
        showEffects: true,
        showObjectChanges: true,
      }
    });
    
    const metadataId = metadataResult.objectChanges?.find(change => 
      change.type === 'created' && change.objectType === '0x2::object::Object'
    )?.objectId;
    
    if (metadataId) {
      console.log('Deployment complete!');
      console.log(`Site metadata object ID: ${metadataId}`);
      console.log('\n=== DEPLOYMENT SUCCESSFUL ===');
      console.log('Your site is now deployed to the Sui blockchain!');
      console.log(`You can access your site using the metadataId: ${metadataId}`);
    } else {
      console.error('Failed to get metadata object ID.');
      console.error('Full result:', JSON.stringify(metadataResult, null, 2));
    }
    
  } catch (error) {
    console.error('Deployment failed:', error);
    if (error.cause) {
      console.error('Cause:', JSON.stringify(error.cause, null, 2));
    }
  }
}

deployToWalrus();
