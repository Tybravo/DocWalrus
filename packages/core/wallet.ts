import fs from 'fs-extra';
import path from 'path';
import { homedir } from 'os';
import axios from 'axios';

// Define wallet config type
export interface WalletConfig {
  address: string;
  network?: 'mainnet' | 'testnet';
  lastConnected?: string;
  lastChecked?: string;
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

// Check wallet status with platform
export const checkWalletStatusWithPlatform = async (address: string): Promise<boolean> => {
  try {
    // Call the platform API to check if the wallet is still connected
    const response = await axios.get(`https://docwalrus.vercel.app/api/wallet/status?address=${address}`);
    return response.data?.connected === true;
  } catch (error) {
    console.error('Error checking wallet status with platform:', error);
    // If we can't reach the platform, assume the wallet is still connected
    return true;
  }
};

// Check if wallet is connected
export const isWalletConnected = async (): Promise<boolean> => {
  const config = await readWalletConfig();
  
  if (!config?.address) {
    return false;
  }
  
  // Check if we need to verify with the platform
  // Only check once every hour to avoid excessive API calls
  const shouldCheckWithPlatform = !config.lastChecked || 
    (new Date().getTime() - new Date(config.lastChecked).getTime() > 60 * 60 * 1000);
  
  if (shouldCheckWithPlatform) {
    const isConnected = await checkWalletStatusWithPlatform(config.address);
    
    // Update the config with the latest status
    if (!isConnected) {
      await disconnectWallet();
      return false;
    } else {
      await saveWalletConfig({
        ...config,
        lastChecked: new Date().toISOString()
      });
    }
  }
  
  return true;
};

// Connect wallet
export const connectWallet = async (address: string, network: 'mainnet' | 'testnet' = 'mainnet'): Promise<void> => {
  await saveWalletConfig({
    address,
    network,
    lastConnected: new Date().toISOString(),
    lastChecked: new Date().toISOString()
  });
};

// Disconnect wallet
export const disconnectWallet = async (): Promise<void> => {
  const configPath = getWalletConfigPath();
  
  if (await fs.pathExists(configPath)) {
    await fs.remove(configPath);
  }
};