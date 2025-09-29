import { ReactNode } from 'react';

// Shared config type for layouts
export interface PageConfig {
  title: string;
  sidebar?: { label: string; path: string }[];
  prevPage?: {
    title: string;
    path: string;
  };
  nextPage?: {
    title: string;
    path: string;
  };
}

// Navbar props
export interface NavbarProps extends PageConfig {
  search?: boolean;
  version?: string[];
  onToggle?: () => void;  // Add this line for mobile menu toggle
  algoliaConfig?: {
    appId: string;
    apiKey: string;
    indexName: string;
  };
}

// Footer props
export interface FooterProps {
  copyright?: string;
  links?: { label: string; href: string }[];
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

// Blog post type
export interface BlogPost {
  title: string;
  date: string;
  author: string;
  tags: string[];
  path: string;
  content: string;
  excerpt: string;
  readingTime: string;
  slug: string;
  lastModified: string;
}

export interface BlogCategory {
  name: string;
  count: number;
  posts: BlogPost[];
}

export interface BlogProps {
  posts: BlogPost[];
  title?: string;
  children?: React.ReactNode;
}

export interface BlogPostProps {
  post: BlogPost;
}

export interface BlogSidebarProps {
  categories: BlogCategory[];
  currentPost?: BlogPost;
}

// Tag props
export interface TagProps {
  tag: string;
  posts: BlogPost[];
}
