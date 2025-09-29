import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { execSync } from 'child_process';

interface BuildOptions {
  out: string;
  minify: boolean;
}

export async function buildSite(options: BuildOptions): Promise<void> {
  const spinner = ora('Building site...').start();
  
  try {
    // Check if we're in a DocWalrus project
    const configPath = path.resolve(process.cwd(), 'docwalrus.config.js');
    
    if (!fs.existsSync(configPath)) {
      spinner.fail('Not in a DocWalrus project. Please run this command in a DocWalrus project directory.');
      process.exit(1);
    }
    
    // Load config
    const config = require(configPath);
    
    // Create build directory
    const buildDir = path.resolve(process.cwd(), options.out);
    fs.emptyDirSync(buildDir);
    
    // Build the site using Vite
    const viteConfigPath = path.resolve(process.cwd(), 'vite.config.ts');
    
    if (!fs.existsSync(viteConfigPath)) {
      spinner.fail('vite.config.ts not found. Please make sure you have a valid DocWalrus project.');
      process.exit(1);
    }
    
    // Run build command
    try {
      execSync(`vite build --outDir ${options.out} ${options.minify ? '' : '--minify false'}`, {
        stdio: 'ignore',
        cwd: process.cwd()
      });
      
      // Copy static files
      const staticDir = path.resolve(process.cwd(), 'static');
      
      if (fs.existsSync(staticDir)) {
        fs.copySync(staticDir, buildDir);
      }
      
      spinner.succeed(`Site built successfully! Output directory: ${chalk.green(options.out)}`);
      
    } catch (error) {
      spinner.fail('Build failed');
      console.error(error);
      process.exit(1);
    }
    
  } catch (error) {
    spinner.fail('Build failed');
    console.error(error);
    process.exit(1);
  }
}