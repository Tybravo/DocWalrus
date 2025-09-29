import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';
// Use a relative import to the local walletBridge.ts file
import { syncWalletToFileSystem, checkFileSystemWallet } from './walletBridge';

// Define network types
export type Network = 'mainnet' | 'testnet';

// Get the appropriate SUI endpoint based on network
export const getSuiEndpoint = (network: Network = 'mainnet'): string => {
  return getFullnodeUrl(network);
};

// Create a SUI client based on the network
export const createSuiClient = (network: Network = 'mainnet'): SuiClient => {
  const endpoint = getSuiEndpoint(network);
  return new SuiClient({ url: endpoint });
};

// Store wallet address in local storage
export const storeWalletAddress = async (address: string, network: Network = 'mainnet'): Promise<void> => {
  // Store in localStorage
  localStorage.setItem('walletAddress', address);
  localStorage.setItem('network', network);
  
  // Sync to file system for CLI usage
  await syncWalletToFileSystem(address, network);
};

// Get wallet address from local storage
export const getWalletAddress = (): string | null => {
  return localStorage.getItem('walletAddress');
};

// Clear wallet address from local storage
export const clearWalletAddress = (): void => {
  localStorage.removeItem('walletAddress');
};

// Store selected network in local storage
export const storeNetwork = (network: Network): void => {
  localStorage.setItem('network', network);
};

// Get selected network from local storage  
export const getNetwork = (): Network => {
  return (localStorage.getItem('network') as Network) || 'testnet';
};

// Format wallet address for display (e.g., 0x1234...5678)
export const formatWalletAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Check if wallet is connected
export const isWalletConnected = (): boolean => {
  return !!getWalletAddress();
};

// Verify wallet connection for CLI operations
export const verifyWalletForCli = async (): Promise<boolean> => {
  const walletAddress = getWalletAddress();
  return !!walletAddress;
};

// Initialize wallet from file system if available
export const initializeWalletFromFileSystem = async (): Promise<void> => {
  const storedWallet = getWalletAddress();
  
  // If no wallet in localStorage, check file system
  if (!storedWallet) {
    const fileSystemWallet = await checkFileSystemWallet();
    
    if (fileSystemWallet?.address) {
      localStorage.setItem('walletAddress', fileSystemWallet.address);
      if (fileSystemWallet.network) {
        localStorage.setItem('network', fileSystemWallet.network);
      }
    }
  }
};