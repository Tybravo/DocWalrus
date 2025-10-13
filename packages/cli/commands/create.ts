import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { homedir } from 'os';
import chalk from 'chalk';
import ora from 'ora';
// Change the import to use a relative path instead
import { isWalletConnected } from '../../core/wallet';
import { authenticateWallet } from '../../core/wallet-auth';

// Create site command
export const createSite = async (siteName: string, template: string = 'default-site'): Promise<void> => {
  console.log(chalk.blue(`🚀 Creating new DocWalrus site: ${siteName} with template: ${template}`));
  
  // Check if wallet is connected
  const walletConnected = await isWalletConnected();
  
  if (!walletConnected) {
    console.log(chalk.yellow('🔐 Wallet not connected. Initiating authentication...'));
    console.log(chalk.gray('This will open your browser to connect your SUI wallet.'));
    
    const spinner = ora('Waiting for wallet connection...').start();
    
    try {
      const authResult = await authenticateWallet();
      
      if (authResult.success) {
        spinner.succeed(chalk.green('✅ Wallet connected successfully!'));
        if (authResult.address) {
          console.log(chalk.gray(`Connected address: ${authResult.address}`));
        }
      } else {
        spinner.fail(chalk.red('❌ Wallet authentication failed'));
        console.log(chalk.red(`Error: ${authResult.error}`));
        console.log(chalk.yellow('\n🔗 Manual connection options:'));
        console.log(chalk.cyan('1. Visit https://docwalrus.vercel.app/get-started to connect your wallet'));
        console.log(chalk.cyan('2. Use the CLI wallet command: docwalrus wallet connect'));
        process.exit(1);
      }
    } catch (error) {
      spinner.fail(chalk.red('❌ Authentication process failed'));
      console.error(chalk.red('Error:'), error);
      console.log(chalk.yellow('\n🔗 Manual connection options:'));
      console.log(chalk.cyan('1. Visit https://docwalrus.vercel.app/get-started to connect your wallet'));
      console.log(chalk.cyan('2. Use the CLI wallet command: docwalrus wallet connect'));
      process.exit(1);
    }
  } else {
    console.log(chalk.green('✅ Wallet already connected'));
  }
  
  // Proceed with site creation
  const spinner = ora('Creating site structure...').start();
  
  try {
    // Create directory if it doesn't exist
    if (!fs.existsSync(siteName)) {
      fs.mkdirSync(siteName, { recursive: true });
    }
    
    // Copy template files
    const templatePath = path.resolve(__dirname, '../../../templates', template);
    if (!fs.existsSync(templatePath)) {
      spinner.fail(chalk.red(`Template "${template}" not found.`));
      console.log(chalk.yellow('Available templates: default-site'));
      process.exit(1);
    }
    
    // Copy template files to destination (Windows-compatible)
    const isWindows = process.platform === 'win32';
    const copyCommand = isWindows 
      ? `xcopy "${templatePath}\\*" "${siteName}\\" /E /I /H /Y /Q`
      : `cp -r "${templatePath}"/* "${siteName}"/`;
    
    execSync(copyCommand, { stdio: 'pipe' });
    
    spinner.text = 'Installing dependencies...';
    
    // Install dependencies
    execSync(`cd "${siteName}" && npm install`, { stdio: 'pipe' });
    
    spinner.succeed(chalk.green(`🎉 Successfully created ${siteName}!`));
    
    // Success message
    console.log(chalk.green(`\n✨ Success! Created ${siteName} at ${path.resolve(siteName)}`));
    console.log(chalk.blue('\n📋 Available commands:'));
    console.log(chalk.cyan('  npm run dev') + chalk.gray('     - Starts the development server'));
    console.log(chalk.cyan('  npm run build') + chalk.gray('   - Builds the app for production'));
    console.log(chalk.cyan('  npm run deploy') + chalk.gray('  - Deploys to Walrus storage on SUI blockchain'));
    
    console.log(chalk.blue('\n🚀 Get started:'));
    console.log(chalk.cyan(`  cd ${siteName}`));
    console.log(chalk.cyan('  npm run dev'));
    console.log(chalk.blue('\n📚 Happy documenting!'));
    
  } catch (error) {
    spinner.fail(chalk.red('Failed to create site'));
    console.error(chalk.red('Error:'), error);
    process.exit(1);
  }
};

export default createSite;