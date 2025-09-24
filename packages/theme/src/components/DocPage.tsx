import React from 'react';
import { DocPageProps } from '../types';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';

export const DocPage = ({ children, config }: DocPageProps) => (
  <div className="min-h-screen flex flex-col">
    <Navbar title={config.title} search />
    <div className="flex flex-1">
      <Sidebar items={config.sidebar || []} />
      <main className="flex-1 p-4">{children}</main>
    </div>
    <Footer />
  </div>
);
