export interface WalletConfig {
    address: string;
    network?: 'mainnet' | 'testnet';
    lastConnected?: string;
}
export declare const getWalletConfigPath: () => string;
export declare const saveWalletConfig: (config: WalletConfig) => Promise<void>;
export declare const readWalletConfig: () => Promise<WalletConfig | null>;
export declare const isWalletConnected: () => Promise<boolean>;
export declare const connectWallet: (address: string, network?: "mainnet" | "testnet") => Promise<void>;
export declare const disconnectWallet: () => Promise<void>;
