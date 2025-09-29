import express from 'express';
import { connectWallet, readWalletConfig, disconnectWallet } from '../../../../packages/core/wallet';

const router = express.Router();

// Connect wallet endpoint
router.post('/api/wallet/connect', async (req, res) => {
  try {
    const { address, network } = req.body;
    
    if (!address) {
      return res.status(400).json({ error: 'Address is required' });
    }
    
    await connectWallet(address, network || 'mainnet');
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error connecting wallet:', error);
    res.status(500).json({ error: 'Failed to connect wallet' });
  }
});

// Get wallet status endpoint
router.get('/api/wallet/status', async (req, res) => {
  try {
    const config = await readWalletConfig();
    res.status(200).json(config || {});
  } catch (error) {
    console.error('Error getting wallet status:', error);
    res.status(500).json({ error: 'Failed to get wallet status' });
  }
});

// Disconnect wallet endpoint
router.post('/api/wallet/disconnect', async (req, res) => {
  try {
    await disconnectWallet();
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error disconnecting wallet:', error);
    res.status(500).json({ error: 'Failed to disconnect wallet' });
  }
});

export default router;