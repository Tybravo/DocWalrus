import React, { ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';

// Import MDX pages
import Home from './pages/mysite.mdx';
import Blog from './pages/blog/index.mdx';

// Define types for frontmatter
interface FrontMatter {
  title?: string;
  sidebar?: Array<{ label: string; href?: string }>;
  posts?: Array<{ title: string; date: string }>;
  [key: string]: any;
}

// Define a type for MDX components with frontMatter
// type MDXComponentType = React.ComponentType & {
//   frontMatter?: FrontMatter;
// };

// Define layout props
interface DocLayoutProps {
  children: ReactNode;
  frontMatter?: FrontMatter;
}

// Simple layout components until theme is properly built
// Update the Navbar component with very explicit styling
const Navbar = ({ title, links }: { title: string; links: Array<{ label: string; href: string }> }) => (
  <nav style={{ backgroundColor: '#7c3aed' }} className="bg-purple-600 text-white p-4 shadow-lg">
    <div className="flex justify-between items-center max-w-7xl mx-auto">
      <h1 className="text-xl font-bold">{title}</h1>
      <div className="flex gap-4">
        {links.map((link, i) => (
          <a key={i} href={link.href} className="hover:underline px-3 py-2 rounded hover:bg-purple-700 transition-colors">
            {link.label}
          </a>
        ))}
      </div>
    </div>
  </nav>
);

// Update the Sidebar component with more obvious styling
const Sidebar = ({ items }: { items?: Array<{ label: string; href?: string }> }) => (
  <div className="bg-gray-100 p-4 w-64 h-full shadow-md">
    <ul className="space-y-2">
      {items?.map((item, i) => (
        <li key={i} className="border-l-4 border-transparent hover:border-purple-600 pl-2">
          <a href={item.href || '#'} className="block py-2 hover:text-purple-600 transition-colors">
            {item.label}
          </a>
        </li>
      ))}
    </ul>
  </div>
);

// Update the Footer component with more obvious styling
const Footer = ({ copyright, links }: { copyright: string; links: Array<{ label: string; href: string }> }) => (
  <footer className="bg-gray-800 text-white p-4 mt-auto shadow-inner">
    <div className="flex justify-between items-center max-w-7xl mx-auto">
      <p>{copyright}</p>
      <div className="flex gap-4">
        {links.map((link, i) => (
          <a key={i} href={link.href} className="hover:underline hover:text-purple-300 transition-colors">
            {link.label}
          </a>
        ))}
      </div>
    </div>
  </footer>
);

// Update the DocPage component with more obvious styling
const DocPage = ({ navbar, sidebar, footer, children }: { navbar: ReactNode; sidebar: ReactNode; footer: ReactNode; children: ReactNode }) => (
  <div className="flex flex-col min-h-screen">
    {navbar}
    <div className="flex flex-1">
      {sidebar}
      <main className="flex-1 p-6 bg-white">{children}</main>
    </div>
    {footer}
  </div>
);

// Layout wrapper for MDX content
const DocLayout = ({ children, frontMatter }: DocLayoutProps) => {
  return (
    <DocPage
      navbar={<Navbar title="DocWalrus" links={[{ label: 'Home', href: '/' }, { label: 'Blog', href: '/blog' }]} />}
      sidebar={<Sidebar items={frontMatter?.sidebar || []} />}
      footer={<Footer copyright="© 2025 DocWalrus" links={[{ label: 'GitHub', href: 'https://github.com' }]} />}
    >
      {children}
    </DocPage>
  );
};

// Wrap MDX components with layout
const WrappedHome = () => {
  // Get frontMatter from the MDX component
  const frontMatter = (Home as unknown as { frontMatter?: FrontMatter }).frontMatter;
  
  return (
    <DocLayout frontMatter={frontMatter}>
      {/* Render the MDX component directly */}
      <Home />
    </DocLayout>
  );
};

const WrappedBlog = () => {
  // Get frontMatter from the MDX component
  const frontMatter = (Blog as unknown as { frontMatter?: FrontMatter }).frontMatter;
  
  return (
    <DocLayout frontMatter={frontMatter}>
      {/* Render the MDX component directly */}
      <Blog />
    </DocLayout>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WrappedHome />} />
        <Route path="/blog" element={<WrappedBlog />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
