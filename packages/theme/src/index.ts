import React, { ReactNode } from 'react';

interface DocPageConfig {
  title: string;
  sidebar: any[]; // Or a more specific type if known
}

interface DocPageProps {
  children: ReactNode;
  config: DocPageConfig;
}

import { Navbar } from './components/Navbar';

// Placeholder for DocPage component
export const DocPage = ({ children, config }: DocPageProps) => {
  return React.createElement('div', null, children);
};

export { Navbar };


export * from './components/Navbar';
export * from './components/Footer';
export * from './components/Sidebar';
export * from './components/DocPage';
export * from './components/Blog';