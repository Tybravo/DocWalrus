import { ReactNode } from 'react';

// Shared config type for layouts
export interface PageConfig {
  title: string;
  sidebar?: { label: string; path: string }[];
}

// Navbar props
export interface NavbarProps extends PageConfig {
  search?: boolean;
  version?: string[];
}

// Footer props
export interface FooterProps {
  copyright?: string;
}

// Sidebar props
export interface SidebarProps {
  items: { label: string; path: string }[];
  isOpen?: boolean;
  onToggle?: () => void;
}

// DocPage props
export interface DocPageProps {
  children: ReactNode;
  config: PageConfig;
}

// Blog props
export interface BlogProps {
  children: ReactNode;
  posts?: { title: string; date: string; excerpt: string; path: string }[];
}
