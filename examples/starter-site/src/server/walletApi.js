"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const wallet_1 = require("../../../../packages/core/wallet");
const router = express_1.default.Router();
// Connect wallet endpoint
router.post('/api/wallet/connect', async (req, res) => {
    try {
        const { address, network } = req.body;
        if (!address) {
            return res.status(400).json({ error: 'Address is required' });
        }
        await (0, wallet_1.connectWallet)(address, network || 'mainnet');
        res.status(200).json({ success: true });
    }
    catch (error) {
        console.error('Error connecting wallet:', error);
        res.status(500).json({ error: 'Failed to connect wallet' });
    }
});
// Get wallet status endpoint
router.get('/api/wallet/status', async (req, res) => {
    try {
        const config = await (0, wallet_1.readWalletConfig)();
        res.status(200).json(config || {});
    }
    catch (error) {
        console.error('Error getting wallet status:', error);
        res.status(500).json({ error: 'Failed to get wallet status' });
    }
});
// Disconnect wallet endpoint
router.post('/api/wallet/disconnect', async (req, res) => {
    try {
        await (0, wallet_1.disconnectWallet)();
        res.status(200).json({ success: true });
    }
    catch (error) {
        console.error('Error disconnecting wallet:', error);
        res.status(500).json({ error: 'Failed to disconnect wallet' });
    }
});
exports.default = router;
