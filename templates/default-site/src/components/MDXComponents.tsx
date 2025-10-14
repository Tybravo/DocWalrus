import React from 'react';
import 'katex/dist/katex.min.css';
import '@code-hike/mdx/styles.css';

// Custom components for MDX
const MDXComponents = {
  // Code block with syntax highlighting
  pre: (props: any) => {
    // Check if we're in dark mode by looking at the document class
    const isDarkMode = document.documentElement.classList.contains('dark');
    
    return (
      <div 
        className="overflow-auto my-4 rounded-md"
        style={{
          boxShadow: isDarkMode 
            ? '0 0 15px rgba(6, 182, 212, 0.6), 0 0 30px rgba(6, 182, 212, 0.4), 0 4px 6px -1px rgba(0, 0, 0, 0.2)' 
            : '0 0 8px rgba(6, 182, 212, 0.4), 0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: isDarkMode 
            ? '2px solid rgba(6, 182, 212, 0.6)' 
            : '1px solid rgba(6, 182, 212, 0.4)',
          transition: 'all 0.3s ease'
        }}
      >
        {props.children}
      </div>
    );
  },
  code: (props: any) => {
    const { children, className, ...rest } = props;
    const match = /language-(\w+)/.exec(className || '');
    
    // Use a standard code block instead of CH.Code
    return (
      <pre className={match ? `language-${match[1]} rounded-md p-4 bg-gray-800 text-white overflow-auto` : ''}>
        <code className={className} {...rest}>
          {children}
        </code>
      </pre>
    );
  },
  // Headings
  // Update heading styles
  h1: (props: any) => (
    <h1 
      className="page-title" // This uses our new page-title class
      {...props} 
    />
  ),
  h2: (props: any) => (
    <h2 
      className="text-2xl md:text-3xl font-bold mt-6 mb-4 text-cyan-500" 
      {...props}
    />
  ),
  h3: (props: any) => <h3 className="text-xl font-bold mt-5 mb-2" {...props} />,
  h4: (props: any) => <h4 className="text-lg font-bold mt-4 mb-2" {...props} />,
  // Paragraphs and lists
  p: (props: any) => <p className="my-3" {...props} />,
  ul: (props: any) => <ul className="list-disc pl-6 my-3" {...props} />,
  ol: (props: any) => <ol className="list-decimal pl-6 my-3" {...props} />,
  li: (props: any) => <li className="my-1" {...props} />,
  // Tables
  table: (props: any) => <table className="min-w-full divide-y divide-gray-200 my-4" {...props} />,
  thead: (props: any) => <thead className="bg-gray-50" {...props} />,
  tbody: (props: any) => <tbody className="divide-y divide-gray-200" {...props} />,
  tr: (props: any) => <tr {...props} />,
  th: (props: any) => <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" {...props} />,
  td: (props: any) => <td className="px-6 py-4 whitespace-nowrap text-sm" {...props} />,
  // Links and images
  a: (props: any) => (
    <a 
      className="hover:opacity-80 transition-opacity" 
      style={{ color: 'rgb(244, 162, 97)' }}
      {...props} 
    />
  ),
  img: (props: any) => <img className="max-w-full h-auto my-4" {...props} />,
  // Blockquotes
  blockquote: (props: any) => <blockquote className="border-l-4 border-gray-200 pl-4 italic my-4" {...props} />,
  // Horizontal rule
  hr: (props: any) => <hr className="my-6 border-t border-gray-200" {...props} />,
  // Math components are handled by rehype-katex
};

export default MDXComponents;