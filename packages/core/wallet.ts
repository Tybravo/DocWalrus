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
  const config = await readWalletConfig();
  return !!config?.address;
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