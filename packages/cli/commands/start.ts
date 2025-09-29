import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { execSync } from 'child_process';
import express from 'express';
import walletApiRouter from '../../../examples/starter-site/src/server/walletApi';

interface StartOptions {
  port: string;
  host: string;
}

// In the startDevServer function
export async function startDevServer(options: StartOptions): Promise<void> {
  // Check if we're in a DocWalrus project
  const configPath = path.resolve(process.cwd(), 'docwalrus.config.js');
  
  if (!fs.existsSync(configPath)) {
    console.log(chalk.red('Not in a DocWalrus project. Please run this command in a DocWalrus project directory.'));
    process.exit(1);
  }
  
  // Start the development server
  console.log(chalk.blue(`Starting development server on ${options.host}:${options.port}...`));
  
  try {
    execSync(`vite --port ${options.port} --host ${options.host}`, {
      stdio: 'inherit',
      cwd: process.cwd()
    });
  } catch (error) {
    console.error('Failed to start development server');
    console.error(error);
    process.exit(1);
  }
  
  // Add API middleware for wallet synchronization
  const app = express();
  app.use(express.json());
  app.use(walletApiRouter);
  
  // Start the API server on a different port
  const apiPort = parseInt(options.port) + 1;
  app.listen(apiPort, options.host, () => {
    console.log(`Wallet API server running at http://${options.host}:${apiPort}`);
  });
}