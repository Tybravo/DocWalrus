import fs from 'fs-extra';
import path from 'path';
import { homedir } from 'os';

// Define wallet config type
export interface WalletConfig {
  address: string;
  network?: 'mainnet' | 'testnet';
  lastConnected?: string;
}

// Get the wallet config file path
export const getWalletConfigPath = (): string => {
  return path.join(homedir(), '.docwalrus', 'wallet.json');
};

// Save wallet config to file system
export const saveWalletConfig = async (config: WalletConfig): Promise<void> => {
  const configPath = getWalletConfigPath();
  
  // Ensure directory exists
  await fs.ensureDir(path.dirname(configPath));
  
  // Write config file
  await fs.writeJson(configPath, config, { spaces: 2 });
};

// Read wallet config from file system
export const readWalletConfig = async (): Promise<WalletConfig | null> => {
  const configPath = getWalletConfigPath();
  
  try {
    if (await fs.pathExists(configPath)) {
      return await fs.readJson(configPath);
    }
  } catch (error) {
    console.error('Error reading wallet config:', error);
  }
  
  return null;
};

// Check if wallet is connected
export const isWalletConnected = async (): Promise<boolean> => {
  // Always check for disconnection by removing the wallet config file
  // This simpler approach doesn't require API calls to the platform
  try {
    // Check if the wallet config exists and is less than 1 hour old
    const configPath = getWalletConfigPath();
    
    if (!await fs.pathExists(configPath)) {
      return false;
    }
    
    const config = await fs.readJson(configPath);
    if (!config?.address) {
      return false;
    }
    
    // Check if the config is older than 5 minutes
    // This forces the CLI to check for wallet connection status frequently
    if (config.lastConnected) {
      const lastConnected = new Date(config.lastConnected).getTime();
      const fiveMinutesAgo = new Date().getTime() - (5 * 60 * 1000);
      
      if (lastConnected < fiveMinutesAgo) {
        // Config is older than 5 minutes, force reconnection
        await disconnectWallet();
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error checking wallet connection:', error);
    return false;
  }
};

// Connect wallet
export const connectWallet = async (address: string, network: 'mainnet' | 'testnet' = 'mainnet'): Promise<void> => {
  await saveWalletConfig({
    address,
    network,
    lastConnected: new Date().toISOString()
  });
};

// Disconnect wallet
export const disconnectWallet = async (): Promise<void> => {
  const configPath = getWalletConfigPath();
  
  if (await fs.pathExists(configPath)) {
    await fs.remove(configPath);
  }
};