"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectWallet = exports.connectWallet = exports.isWalletConnected = exports.readWalletConfig = exports.saveWalletConfig = exports.getWalletConfigPath = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const os_1 = require("os");
// Get the wallet config file path
const getWalletConfigPath = () => {
    return path_1.default.join((0, os_1.homedir)(), '.docwalrus', 'wallet.json');
};
exports.getWalletConfigPath = getWalletConfigPath;
// Save wallet config to file system
const saveWalletConfig = async (config) => {
    const configPath = (0, exports.getWalletConfigPath)();
    // Ensure directory exists
    await fs_extra_1.default.ensureDir(path_1.default.dirname(configPath));
    // Write config file
    await fs_extra_1.default.writeJson(configPath, config, { spaces: 2 });
};
exports.saveWalletConfig = saveWalletConfig;
// Read wallet config from file system
const readWalletConfig = async () => {
    const configPath = (0, exports.getWalletConfigPath)();
    try {
        if (await fs_extra_1.default.pathExists(configPath)) {
            return await fs_extra_1.default.readJson(configPath);
        }
    }
    catch (error) {
        console.error('Error reading wallet config:', error);
    }
    return null;
};
exports.readWalletConfig = readWalletConfig;
// Check if wallet is connected
const isWalletConnected = async () => {
    const config = await (0, exports.readWalletConfig)();
    return !!config?.address;
};
exports.isWalletConnected = isWalletConnected;
// Connect wallet
const connectWallet = async (address, network = 'mainnet') => {
    await (0, exports.saveWalletConfig)({
        address,
        network,
        lastConnected: new Date().toISOString()
    });
};
exports.connectWallet = connectWallet;
// Disconnect wallet
const disconnectWallet = async () => {
    const configPath = (0, exports.getWalletConfigPath)();
    if (await fs_extra_1.default.pathExists(configPath)) {
        await fs_extra_1.default.remove(configPath);
    }
};
exports.disconnectWallet = disconnectWallet;
