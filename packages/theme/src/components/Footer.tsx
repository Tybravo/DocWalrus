import React from 'react';
import { FooterProps } from '../types';

export const Footer = ({ copyright = '© 2025 Docwalrus' }: FooterProps) => (
  <footer className="bg-gray-800 dark:bg-dark-surface border-t border-gray-700 dark:border-gray-800 transition-colors">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-lg font-semibold text-white dark:text-dark-text mb-4">About</h3>
          <p className="text-gray-300 dark:text-gray-400">
            DocWalrus is a modern documentation platform that makes it easy to create and maintain beautiful documentation.
          </p>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-white dark:text-dark-text mb-4">Links</h3>
          <ul className="space-y-2">
            <li>
              <a href="/docs" className="text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-dark-text transition-colors">
                Documentation
              </a>
            </li>
            <li>
              <a href="/blog" className="text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-dark-text transition-colors">
                Blog
              </a>
            </li>
            <li>
              <a href="https://github.com/your-org/docwalrus" className="text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-dark-text transition-colors">
                GitHub
              </a>
            </li>
          </ul>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-white dark:text-dark-text mb-4">Contact</h3>
          <ul className="space-y-2">
            <li>
              <a href="https://twitter.com/docwalrus" className="text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-dark-text transition-colors">
                Twitter
              </a>
            </li>
            <li>
              <a href="https://discord.gg/docwalrus" className="text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-dark-text transition-colors">
                Discord
              </a>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="mt-8 pt-8 border-t border-gray-700 dark:border-gray-800">
        <p className="text-center text-gray-300 dark:text-gray-400">{copyright}</p>
      </div>
    </div>
  </footer>
);
