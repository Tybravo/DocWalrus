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
  if (!siteName) {
    console.log(chalk.red('Error: Project name is required'));
    console.log(chalk.yellow('Usage: docwalrus create <project-name>'));
    process.exit(1);
  }
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
        console.log(chalk.red(`Error: ${authResult.error || 'Unable to connect wallet'}`));
        process.exit(1);
      }
    } catch (error) {
      spinner.fail(chalk.red('❌ Authentication process failed'));
      console.error(chalk.red('Error:'), error);
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
    
    // Find templates directory - Updated logic for both dev and production
    function findTemplatesPath(): string {
      // When running from installed CLI, templates should be in the CLI package
      const installedTemplates = path.resolve(__dirname, '../templates');
      if (fs.existsSync(installedTemplates)) {
        return installedTemplates;
      }
      
      // When running from development, templates are in monorepo root
      const devTemplates = path.resolve(__dirname, '../../../templates');
      if (fs.existsSync(devTemplates)) {
        return devTemplates;
      }
      
      // Fallback: try to find from current working directory
      let currentPath = process.cwd();
      while (currentPath !== path.parse(currentPath).root) {
        const templatesPath = path.join(currentPath, 'templates');
        if (fs.existsSync(templatesPath)) {
          return templatesPath;
        }
        currentPath = path.dirname(currentPath);
      }
      
      throw new Error('Templates directory not found');
    }
    
    // Get templates path and specific template path
    const templatesPath = findTemplatesPath();
    const templatePath = path.join(templatesPath, template);
    
    if (!fs.existsSync(templatePath)) {
      spinner.fail(chalk.red(`Template "${template}" not found.`));
      console.log(chalk.yellow(`Looking for template at: ${templatePath}`));
      console.log(chalk.yellow(`Templates directory: ${templatesPath}`));
      
      // List available templates
      try {
        const availableTemplates = fs.readdirSync(templatesPath)
          .filter(item => fs.statSync(path.join(templatesPath, item)).isDirectory());
        console.log(chalk.yellow(`Available templates: ${availableTemplates.join(', ')}`));
      } catch (err) {
        console.log(chalk.yellow('Could not list available templates'));
      }
      
      process.exit(1);
    }
    
    // Copy template files using the existing copyDir function
    const copyDir = (src: string, dest: string) => {
      // Create destination directory
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }
      
      // Read source directory
      const entries = fs.readdirSync(src, { withFileTypes: true });
      
      for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        
        // Skip node_modules and .git directories
        if (entry.name === 'node_modules' || entry.name === '.git') {
          continue;
        }
        
        if (entry.isDirectory()) {
          // Recursively copy directory
          copyDir(srcPath, destPath);
        } else {
          // Copy file with retry logic
          let retries = 3;
          while (retries > 0) {
            try {
              fs.copyFileSync(srcPath, destPath);
              break;
            } catch (err) {
              retries--;
              if (retries === 0) throw err;
              // Wait a bit before retrying
              console.log(`Retrying copy of ${entry.name}...`);
              execSync('timeout /t 1', { stdio: 'ignore' });
            }
          }
        }
      }
    };
    
    // Copy template files
    copyDir(templatePath, siteName);
    
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