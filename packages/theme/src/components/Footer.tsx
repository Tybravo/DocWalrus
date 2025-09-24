import React from 'react';
import { FooterProps } from '../types';

export const Footer = ({ copyright = '© 2025 Docwalrus' }: FooterProps) => (
  <footer className="bg-gray-800 text-white p-4 text-center">
    <p>{copyright}</p>
  </footer>
);
