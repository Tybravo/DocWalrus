import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useCurrentAccount, useDisconnectWallet } from '@mysten/dapp-kit';
import { formatWalletAddress } from '../utils/walletUtils';
import WalletModal from './WalletModal';
import { AnimatePresence } from 'framer-motion';

const LinkAny = Link as unknown as React.ComponentType<any>;

interface HeaderProps {
  currentPath?: string;
}

const Header: React.FC<HeaderProps> = ({ currentPath }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDocMenuOpen, setIsDocMenuOpen] = useState(false);
  const [network, setNetwork] = useState<'mainnet' | 'testnet'>('testnet');
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  
  // Close doc menu when clicking outside
  const docMenuRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (docMenuRef.current && !docMenuRef.current.contains(event.target as Node)) {
        setIsDocMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const currentAccount = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();

  return (
    <>
      {/* Wallet Modal */}
      <AnimatePresence>
        {isWalletModalOpen && (
          <WalletModal 
            isOpen={isWalletModalOpen} 
            onClose={() => setIsWalletModalOpen(false)} 
          />
        )}
      </AnimatePresence>

      {/* Sticky Header with Cyan Glow */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[#0A1A2F]/80 border-b border-cyan-400/20 shadow-[0_0_25px_rgba(0,255,255,0.3)]">
        <div className="mx-auto max-w-7xl px-4 py-3">
          <div className="glass-nav rounded-2xl px-4 py-3 flex items-center justify-between shadow-[0_0_15px_rgba(0,255,255,0.4)]">
            <LinkAny to="/" className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-lg bg-cyan-400/20 border border-cyan-300/40 shadow-[0_0_18px_rgba(0,255,255,0.35)]" />
              <span className="font-semibold tracking-wide">Docwalrus</span>
            </LinkAny>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8 text-sm">
              <div className="relative" ref={docMenuRef}>
                <button 
                  onClick={() => setIsDocMenuOpen(!isDocMenuOpen)}
                  className="text-faint hover:text-white transition-colors hover:-translate-y-0.5 inline-flex items-center"
                >
                  Documentation
                  {/* <svg 
                    className={`w-4 h-4 ml-1 transition-transform ${isDocMenuOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg> */}
                </button>
                
                {isDocMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 mt-2 w-48 glass-nav rounded-xl p-2 shadow-[0_0_15px_rgba(0,255,255,0.4)] border border-cyan-400/20 z-50"
                  >
                    <LinkAny to="/installation" className="block px-4 py-2 text-faint hover:text-white hover:bg-cyan-400/10 rounded-lg transition-colors">
                      Installation
                    </LinkAny>
                    <LinkAny to="/configuration" className="block px-4 py-2 text-faint hover:text-white hover:bg-cyan-400/10 rounded-lg transition-colors">
                      Configuration
                    </LinkAny>
                    <LinkAny to="/deployment" className="block px-4 py-2 text-faint hover:text-white hover:bg-cyan-400/10 rounded-lg transition-colors">
                      Deployment
                    </LinkAny>
                    <LinkAny to="/support" className="block px-4 py-2 text-faint hover:text-white hover:bg-cyan-400/10 rounded-lg transition-colors">
                      Support
                    </LinkAny>
                  </motion.div>
                )}
              </div>
              <a href="/blog#" className="text-faint hover:text-white transition-colors hover:-translate-y-0.5 inline-block">Blog</a>
              <a href="/pricing#" className="text-faint hover:text-white transition-colors hover:-translate-y-0.5 inline-block">Pricing</a>
              <a href="/explore#" className="text-faint hover:text-white transition-colors hover:-translate-y-0.5 inline-block">Explore</a>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden flex flex-col space-y-1 p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="w-6 h-0.5 bg-white"></span>
              <span className="w-6 h-0.5 bg-white"></span>
              <span className="w-6 h-0.5 bg-white"></span>
            </button>

            <div className="hidden md:flex items-center space-x-3">
              {/* Network Selection */}
              <div className="flex items-center bg-black/30 rounded-xl overflow-hidden">
                <button 
                  className={`px-3 py-1.5 text-xs ${network === 'mainnet' ? 'bg-cyan-500/30 text-white' : 'text-gray-400'}`}
                  onClick={() => setNetwork('mainnet')}
                >
                  Mainnet
                </button>
                <button 
                  className={`px-3 py-1.5 text-xs ${network === 'testnet' ? 'bg-cyan-500/30 text-white' : 'text-gray-400'}`}
                  onClick={() => setNetwork('testnet')}
                >
                  Testnet
                </button>
              </div>
              
              {/* Wallet Connection */}
              {currentAccount ? (
                <div className="flex items-center space-x-2">
                  <div className="bg-cyan-500/20 border border-cyan-400/30 rounded-xl px-3 py-1.5 text-xs">
                    {formatWalletAddress(currentAccount.address)}
                  </div>
                  <button 
                    onClick={() => disconnect()}
                    className="bg-red-500/20 border border-red-400/30 rounded-xl px-3 py-1.5 text-xs hover:bg-red-500/30 transition-colors"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setIsWalletModalOpen(true)}
                  className="bg-cyan-500/20 border border-cyan-400/30 rounded-xl px-4 py-1.5 text-xs hover:bg-cyan-500/30 transition-colors"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </div>

          {/* Mobile Dropdown Menu */}
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="md:hidden mt-4 glass-nav rounded-2xl p-4 space-y-3"
            >
              <div className="block text-faint">Documentation</div>
              <div className="pl-4 space-y-2">
                <LinkAny to="/installation" className="block text-faint hover:text-white transition-colors">Installation</LinkAny>
                <LinkAny to="/configuration" className="block text-faint hover:text-white transition-colors">Configuration</LinkAny>
                <LinkAny to="/deployment" className="block text-faint hover:text-white transition-colors">Deployment</LinkAny>
                <LinkAny to="/support" className="block text-faint hover:text-white transition-colors">Support</LinkAny>
              </div>
              <a href="/blog#" className="block text-faint hover:text-white transition-colors">Blog</a>
              <a href="/pricing#" className="block text-faint hover:text-white transition-colors">Pricing</a>
              <a href="/explore#" className="block text-faint hover:text-white transition-colors">Explore</a>
              
              {/* Mobile Wallet Connection */}
              {currentAccount ? (
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xs text-cyan-300">{formatWalletAddress(currentAccount.address)}</span>
                  <button 
                    onClick={() => disconnect()}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setIsWalletModalOpen(true)}
                  className="w-full btn-primary-glow rounded-xl px-4 py-2 text-sm text-center mt-4"
                >
                  Connect Wallet
                </button>
              )}
            </motion.div>
          )}
        </div>
      </header>

      {/* Add padding to prevent content from hiding under the fixed header */}
      <div className="pt-20"></div>
    </>
  );
};

export default Header;