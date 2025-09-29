import React, { useState } from 'react';
import { DocPageProps } from '../types';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';

export const DocPage = ({ children, config }: DocPageProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-dark-bg transition-colors">
      <Navbar 
        title={config.title} 
        search 
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      
      <div className="flex-1 flex flex-col lg:flex-row">
        <Sidebar 
          items={config.sidebar || []} 
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(false)}
        />
        
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-3xl mx-auto">
            <div className="prose dark:prose-invert prose-primary max-w-none">
              {children}
            </div>
            
            {/* Navigation between pages */}
            <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                {config.prevPage && (
                  <a
                    href={config.prevPage.path}
                    className="flex items-center text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    {config.prevPage.title}
                  </a>
                )}
                
                {config.nextPage && (
                  <a
                    href={config.nextPage.path}
                    className="flex items-center text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light transition-colors sm:ml-auto"
                  >
                    {config.nextPage.title}
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  );
};
