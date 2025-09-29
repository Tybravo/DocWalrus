import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
// Fix the import path to use the package name
import { generateVersionedDocs } from '@docwalrus/core';

interface VersionOptions {
  label?: string;
}

export async function versionDocs(version: string, options: VersionOptions): Promise<void> {
  // Check if we're in a DocWalrus project
  const configPath = path.resolve(process.cwd(), 'docwalrus.config.js');
  
  if (!fs.existsSync(configPath)) {
    console.log(chalk.red('Not in a DocWalrus project. Please run this command in a DocWalrus project directory.'));
    process.exit(1);
  }
  
  // Check if docs directory exists
  const docsDir = path.resolve(process.cwd(), 'docs');
  
  if (!fs.existsSync(docsDir)) {
    console.log(chalk.red('Docs directory not found. Please create a docs directory first.'));
    process.exit(1);
  }
  
  // Get label if not provided
  let label = options.label || version;
  
  if (!options.label) {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'label',
        message: 'Enter a label for this version:',
        default: version
      }
    ]);
    
    label = answers.label;
  }
  
  // Create versioned docs
  const spinner = ora(`Creating version ${version}...`).start();
  
  try {
    // Create versions.json if it doesn't exist
    const versionsPath = path.resolve(process.cwd(), 'versions.json');
    let versions: { version: string; label: string }[] = [];
    
    if (fs.existsSync(versionsPath)) {
      versions = await fs.readJSON(versionsPath);
    }
    
    // Check if version already exists
    if (versions.some(v => v.version === version)) {
      spinner.fail(`Version ${version} already exists.`);
      process.exit(1);
    }
    
    // Add new version
    versions.push({ version, label });
    
    // Sort versions by semver
    versions.sort((a, b) => {
      const aParts = a.version.split('.').map(Number);
      const bParts = b.version.split('.').map(Number);
      
      for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
        const aPart = aParts[i] || 0;
        const bPart = bParts[i] || 0;
        
        if (aPart !== bPart) {
          return bPart - aPart; // Descending order
        }
      }
      
      return 0;
    });
    
    // Write versions.json
    await fs.writeJSON(versionsPath, versions, { spaces: 2 });
    
    // Create versioned docs
    generateVersionedDocs(docsDir, version);
    
    // Create versioned sidebars
    const sidebarsPath = path.resolve(process.cwd(), 'sidebars.js');
    
    if (fs.existsSync(sidebarsPath)) {
      const versionedSidebarsDir = path.resolve(process.cwd(), 'versioned_sidebars');
      fs.mkdirSync(versionedSidebarsDir, { recursive: true });
      
      fs.copyFileSync(
        sidebarsPath,
        path.join(versionedSidebarsDir, `version-${version}-sidebars.js`)
      );
    }
    
    spinner.succeed(`Version ${version} created successfully!`);
    
  } catch (error) {
    spinner.fail('Failed to create version');
    console.error(error);
    process.exit(1);
  }
}