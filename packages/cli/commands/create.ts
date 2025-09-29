import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { homedir } from 'os';
// Change the import to use a relative path instead
import { isWalletConnected } from '../../core/wallet';

// Create site command
export const createSite = async (siteName: string, template: string = 'standard'): Promise<void> => {
  // Check if wallet is connected
  if (!(await isWalletConnected())) {
    console.error('\x1b[31mError: Wallet not connected. Please connect your SUI wallet first.\x1b[0m');
    console.log('\x1b[33mVisit https://docwalrus.com/get-started to connect your wallet.\x1b[0m');
    process.exit(1);
  }
  
  console.log(`Creating new Docwalrus site: ${siteName} with template: ${template}`);
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(siteName)) {
    fs.mkdirSync(siteName, { recursive: true });
  }
  
  // Copy template files
  const templatePath = path.resolve(__dirname, '../../templates', template);
  if (!fs.existsSync(templatePath)) {
    console.error(`Template "${template}" not found.`);
    process.exit(1);
  }
  
  // Copy template files to destination
  execSync(`cp -r ${templatePath}/* ${siteName}/`);
  
  // Install dependencies
  console.log('Installing dependencies...');
  execSync(`cd ${siteName} && npm install`, { stdio: 'inherit' });
  
  console.log(`\x1b[32mSuccess! Created ${siteName} at ${path.resolve(siteName)}\x1b[0m`);
  console.log('\nInside that directory, you can run several commands:');
  console.log('\n  \x1b[36mnpm run dev\x1b[0m');
  console.log('    Starts the development server.');
  console.log('\n  \x1b[36mnpm run build\x1b[0m');
  console.log('    Builds the app for production.');
  console.log('\n  \x1b[36mnpm run deploy\x1b[0m');
  console.log('    Deploys the app to Walrus storage on SUI blockchain.');
  console.log('\nWe suggest that you begin by typing:');
  console.log(`\n  \x1b[36mcd ${siteName}\x1b[0m`);
  console.log('  \x1b[36mnpm run dev\x1b[0m');
  console.log('\nHappy documenting!');
};

export default createSite;