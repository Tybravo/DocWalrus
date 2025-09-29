import React from 'react';
import { motion } from 'framer-motion';
import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose }) => {
  const currentAccount = useCurrentAccount();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass rounded-2xl p-6 max-w-md w-full mx-4"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-white">Connect Wallet</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="text-center">
          {currentAccount ? (
            <div className="bg-cyan-500/20 rounded-xl p-4 mb-4">
              <p className="text-sm text-faint mb-2">Connected as:</p>
              <p className="text-cyan-300 font-mono break-all">{currentAccount.address}</p>
            </div>
          ) : (
            <p className="text-faint mb-6">Select a wallet to connect to Docwalrus</p>
          )}
          
          <div className="mt-4">
            <ConnectButton 
              className="w-full btn-primary-glow rounded-xl px-4 py-3 text-sm font-medium"
            />
          </div>
          
          <p className="mt-6 text-xs text-faint">
            By connecting your wallet, you agree to the Docwalrus Terms of Service and Privacy Policy
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default WalletModal;