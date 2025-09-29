import React from 'react';
// @ts-ignore
import { motion, AnimatePresence } from 'framer-motion';
import { SidebarProps } from '../types';

export const Sidebar = ({ items, isOpen = true, onToggle }: SidebarProps) => {
  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black lg:hidden z-20"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: -250 }}
            animate={{ x: 0 }}
            exit={{ x: -250 }}
            className="fixed left-0 top-0 h-full w-64 z-30 lg:relative lg:translate-x-0"
          >
            <div className="h-full bg-gray-100 dark:bg-dark-surface p-4 shadow-lg dark:shadow-gray-900">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text">Navigation</h2>
                <button
                  onClick={onToggle}
                  className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 lg:hidden"
                  aria-label="Close sidebar"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <nav>
                <ul className="space-y-1">
                  {items.map((item, i) => (
                    <li key={i}>
                      <a
                        href={item.path}
                        className="block px-4 py-2 rounded-md text-gray-700 hover:bg-gray-200 hover:text-gray-900 
                        dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white transition-colors"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
