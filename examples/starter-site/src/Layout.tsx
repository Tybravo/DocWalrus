// Layout component
import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { initializeWalletFromFileSystem } from './utils/walletUtils';
import Header from './components/Header';
import Footer from './components/Footer';

function Layout() {
  const location = useLocation();

  useEffect(() => {
    const init = async () => {
      try {
        await initializeWalletFromFileSystem();
      } catch (error) {
        console.error('Failed to initialize wallet:', error);
      }
    };
    init();
  }, []);

  return (
    <div className="min-h-screen text-white bg-deep-space relative overflow-hidden">
      {location.pathname !== '/' && <Header currentPath={location.pathname} />}
      {/* Use React.createElement for Outlet to bypass the current TS JSX type mismatch */}
      {React.createElement(Outlet as any)}
      <Footer />
    </div>
  );
}

export default Layout;