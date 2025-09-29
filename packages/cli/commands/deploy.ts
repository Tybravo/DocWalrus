import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
// Fix the import path to use the package name
import { uploadToWalrus, deploy, createSiteMetadata } from '@docwalrus/adapter-walrus';
import { buildSite } from './build';

interface DeployOptions {
  build: boolean;
  key?: string;
  endpoint: string;
  walrusPublisher?: string;
  walrusAggregator?: string;
  epochs?: number;
}

export async function deploySite(options: DeployOptions): Promise<void> {
  // Check if we're in a DocWalrus project
  const configPath = path.resolve(process.cwd(), 'docwalrus.config.js');
  
  if (!fs.existsSync(configPath)) {
    console.log(chalk.red('Not in a DocWalrus project. Please run this command in a DocWalrus project directory.'));
    process.exit(1);
  }
  
  // Load config
  const config = require(configPath);
  
  // Build the site if requested
  if (options.build) {
    await buildSite({ out: 'build', minify: true });
  }
  
  // Check if build directory exists
  const buildDir = path.resolve(process.cwd(), 'build');
  
  if (!fs.existsSync(buildDir)) {
    console.log(chalk.red('Build directory not found. Please run "docwalrus build" first.'));
    process.exit(1);
  }
  
  // Get private key if not provided
  let privateKey = options.key;
  
  if (!privateKey) {
    const answers = await inquirer.prompt([
      {
        type: 'password',
        name: 'privateKey',
        message: 'Enter your SUI wallet private key:',
        validate: (input) => {
          if (input.length > 0) return true;
          return 'Private key is required';
        }
      }
    ]);
    
    privateKey = answers.privateKey;
  }

  // Ensure we have a non-undefined string and satisfy TypeScript
  if (!privateKey) {
    console.log(chalk.red('Private key is required.'));
    process.exit(1);
  }
  const privateKeyStr: string = privateKey;
  
  // Configure Walrus service
  const walrusConfig = {
    publisherUrl: options.walrusPublisher || 'https://publisher.walrus-testnet.walrus.space/v1/blobs',
    aggregatorUrl: options.walrusAggregator || 'https://aggregator.walrus-testnet.walrus.space/v1/api',
    epochs: options.epochs || 1,
    deletable: false
  };
  
  // Upload files to Walrus service
  const spinner = ora('Uploading files to Walrus service...').start();
  
  try {
    const blobIds = await uploadToWalrus(buildDir, privateKeyStr, walrusConfig);
    
    spinner.succeed(`${blobIds.length} files uploaded to Walrus service successfully!`);
    
    // Create site metadata
    const siteMetadata = createSiteMetadata(
      config.title || 'DocWalrus Site',
      config.tagline || 'A site built with DocWalrus',
      blobIds
    );
    
    // Deploy site metadata to SUI blockchain
    spinner.text = 'Deploying site metadata to SUI blockchain...';
    spinner.start();
    
    const metadataId = await deploy(siteMetadata, privateKeyStr, options.endpoint);
    
    spinner.succeed('Site deployed successfully!');
    
    console.log(chalk.green('\n✅ Your site is now available!'));
    console.log(chalk.blue('\nSite metadata ID (on SUI blockchain):'));
    console.log(chalk.yellow(metadataId));
    console.log(chalk.blue('\nFiles stored on Walrus service with blob IDs:'));
    blobIds.forEach(file => {
      console.log(chalk.yellow(`  - ${file.path}: ${file.blobId}`));
    });
    console.log(chalk.blue('\nSave these IDs to access your site later.'));
    
  } catch (error) {
    spinner.fail('Deployment failed');
    console.error(chalk.red('\n❌ Deployment failed:'));
    if (error instanceof Error) {
      console.error(chalk.red(error.message));
    } else {
      console.error(chalk.red('Unknown error occurred'));
    }
    console.log(chalk.blue('\n💡 Tip: Make sure you have sufficient WAL tokens for storage costs.'));
    process.exit(1);
  }
}