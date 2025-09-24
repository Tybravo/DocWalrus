import React, { useState } from 'react';
// @ts-ignore
import { motion, AnimatePresence } from 'framer-motion';
import { SidebarProps } from '../types';

export const Sidebar = ({ items, isOpen = true, onToggle }: SidebarProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 250, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          className="bg-gray-100 p-4 shadow-lg"
        >
          <button onClick={onToggle} className="mb-4">Toggle</button>
          <ul>
            {items.map((item, i) => (
              <li key={i} className="py-2"><a href={item.path}>{item.label}</a></li>
            ))}
          </ul>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
