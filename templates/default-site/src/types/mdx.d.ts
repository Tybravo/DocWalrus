declare module '*.mdx' {
  import React from 'react';
  
  export interface FrontMatter {
    title?: string;
    sidebar?: Array<{ label: string; href?: string; items?: Array<{ label: string; href?: string }> }>;
    posts?: Array<{ title: string; date: string; excerpt?: string; path?: string; author?: string; tags?: string[] }>;
    [key: string]: any;
  }
  
  const MDXComponent: React.ComponentType & {
    frontMatter?: FrontMatter;
  };
  
  export default MDXComponent;
}

declare module '@code-hike/mdx/components' {
  import React from 'react';
  
  export const CH: {
    Code: React.ComponentType<{
      children: React.ReactNode;
      language?: string;
      [key: string]: any;
    }>;
    // Add other CH components as needed
  };
}
