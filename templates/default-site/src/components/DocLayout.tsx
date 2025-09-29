import React, { ReactNode, useEffect, useState } from 'react';
import { MDXProvider } from '@mdx-js/react';
import MDXComponents from './MDXComponents';
import Sidebar from './Sidebar.tsx';
import { SidebarItem, loadSidebarData } from '../utils/sidebarGenerator';

// Define types for frontmatter
interface FrontMatter {
  title?: string;
  sidebar?: Array<{ label: string; href?: string }>;
  posts?: Array<{ title: string; date: string }>;
  [key: string]: any;
}

// Define layout props
interface DocLayoutProps {
  children: ReactNode;
  frontMatter?: FrontMatter;
  currentPath: string;
}

// Layout component
const DocLayout: React.FC<DocLayoutProps> = ({ children, frontMatter, currentPath }) => {
  const [sidebarItems, setSidebarItems] = useState<SidebarItem[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Only load sidebar data once and cache it
    if (sidebarItems.length === 0) {
      loadSidebarData().then(data => {
        setSidebarItems(data);
      });
    }
    
    // Check for saved theme preference or use system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else if (savedTheme === 'light') {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []); // Remove dependency to prevent re-loading

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  useEffect(() => {
    const handleCloseMobileMenu = () => {
      setIsSidebarOpen(false);
    };

    window.addEventListener('closeMobileMenu', handleCloseMobileMenu);
    return () => {
      window.removeEventListener('closeMobileMenu', handleCloseMobileMenu);
    };
  }, []);

  return (
    <MDXProvider components={MDXComponents}>
      <div className={`docwalrus-layout min-h-screen flex flex-col ${darkMode ? 'dark' : ''}`}>
        <header className="text-white p-4 w-full" style={{ background: 'rgba(244, 162, 97, 1)' }}>
          <div className="container mx-auto px-4">
            {/* Logo and mobile menu button in one row - centered on mobile */}
            <div className="flex md:justify-between justify-center items-center">
              <div className="flex items-center">
                <button 
                  className="mr-4 lg:hidden"
                  onClick={toggleSidebar}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <h1 className="text-xl font-bold">{frontMatter?.title || 'DocWalrus'}</h1>
              </div>
              
              {/* Desktop navigation */}
              <nav className="hidden md:flex items-center">
                <ul className="flex space-x-4 mr-4">
                  <li><a href="#/" className="text-white hover:opacity-80 transition-opacity">Home</a></li>
                  <li><a href="#/blog" className="text-white hover:opacity-80 transition-opacity">Blog</a></li>
                  <li><a href="#/docs" className="text-white hover:opacity-80 transition-opacity">Docs</a></li>
                </ul>
                {/* Theme Toggle Button */}
                <button 
                  onClick={toggleDarkMode} 
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                  aria-label="Toggle dark mode"
                >
                  {darkMode ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" fillRule="evenodd" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                  )}
                </button>
              </nav>
            </div>
            
            {/* Mobile navigation - appears below logo and centered */}
            <nav className="md:hidden mt-3 flex flex-col items-center">
              <ul className="flex justify-center items-center space-x-4 mb-2">
                <li><a href="#/" className="text-white hover:opacity-80 transition-opacity" onClick={() => setIsSidebarOpen(false)}>Home</a></li>
                <li><a href="#/blog" className="text-white hover:opacity-80 transition-opacity" onClick={() => setIsSidebarOpen(false)}>Blog</a></li>
                <li><a href="#/docs" className="text-white hover:opacity-80 transition-opacity" onClick={() => setIsSidebarOpen(false)}>Docs</a></li>
                {/* Theme Toggle Button - now next to Docs */}
                <li>
                  <button 
                    onClick={toggleDarkMode} 
                    className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors ml-2"
                    aria-label="Toggle dark mode"
                  >
                    {darkMode ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" fillRule="evenodd" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                      </svg>
                    )}
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </header>
        
        <div className="flex flex-1 w-full">
          {/* Mobile sidebar */}
          <div 
            className={`fixed inset-0 z-20 transition-opacity ${
              isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
          >
            <div className="absolute inset-0 bg-black opacity-50" onClick={toggleSidebar}></div>
            <div className={`absolute left-0 top-0 h-full w-64 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} shadow-lg`}>
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="font-medium">Navigation</h2>
                <button onClick={toggleSidebar}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div onClick={() => setIsSidebarOpen(false)}>
                <Sidebar items={sidebarItems} currentPath={currentPath} />
              </div>
            </div>
          </div>
          
          {/* Desktop sidebar */}
          <div className="hidden lg:block">
            <Sidebar items={sidebarItems} currentPath={currentPath} />
          </div>
          
          <main className={`flex-1 p-4 w-full overflow-x-hidden ${darkMode ? 'bg-gray-900 text-white' : 'bg-white'}`}>
            <div className="container mx-auto max-w-4xl px-4">
              {children}
            </div>
          </main>
        </div>
        
        {/* Update the footer styling */}
        <footer className="p-4 text-center text-white w-full" style={{ background: 'rgba(244, 162, 97, 1)' }}>
          <p>© {new Date().getFullYear()} - Built with DocWalrus</p>
        </footer>
      </div>
    </MDXProvider>
  );
};

export default DocLayout;