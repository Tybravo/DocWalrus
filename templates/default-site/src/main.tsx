import React, { ReactNode, useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import 'katex/dist/katex.min.css';
import '@code-hike/mdx/styles.css';

// Import MDX pages
import Home from './pages/mysite.mdx';
import Blog from './pages/blog/index.mdx';
import GitSemanticVersioning from './pages/blog/git-semantic-versioning.mdx';

// Import components
import MainDocLayout from './components/DocLayout';

// Wrap MDX components with layout
const WrappedPage = ({ Component, path }: { Component: any, path: string }) => {
  const frontMatter = Component.frontMatter;
  return (
    <MainDocLayout frontMatter={frontMatter} currentPath={path}>
      <Component />
    </MainDocLayout>
  );
};

// Simple custom router
const SimpleRouter: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>(
    window.location.hash.slice(1) || '/'
  );

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPath(window.location.hash.slice(1) || '/');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Render the appropriate component based on the path
  const renderContent = () => {
    switch (currentPath) {
      case '/':
        return <WrappedPage Component={Home} path={currentPath} />;
      case '/blog':
        return <WrappedPage Component={Blog} path={currentPath} />;
      case '/blog/git-semantic-versioning':
        return <WrappedPage Component={GitSemanticVersioning} path={currentPath} />;
      default:
        return <WrappedPage Component={Home} path={currentPath} />;
    }
  };

  return <>{renderContent()}</>;
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  // Remove StrictMode for faster development
  <SimpleRouter />
);
