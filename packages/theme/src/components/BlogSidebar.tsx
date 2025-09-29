import React from 'react';
import { BlogPost, BlogCategory } from '../types';

interface BlogSidebarProps {
  posts: BlogPost[];
  currentPost?: BlogPost;
}

export const BlogSidebar: React.FC<BlogSidebarProps> = ({ posts, currentPost }) => {
  return (
    <nav className="space-y-1">
      {posts.map((post, index) => (
        <a
          key={post.slug || index}
          href={post.path}
          className={`block px-3 py-2 rounded-md ${
            currentPost?.slug === post.slug
            ? 'text-[rgba(244,162,97,1)] font-medium'
            : 'text-gray-600 hover:text-[rgba(244,162,97,1)]'
          } transition-colors duration-200`}
        >
          {post.title}
        </a>
      ))}
      
      {/* Tags section */}
      <div className="mt-8">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Popular Tags</h3>
        <div className="flex flex-wrap gap-2">
          {/* Get unique tags */}
          {Array.from(new Set(posts.flatMap(post => post.tags || []))).map(tag => (
            <a
              key={tag}
              href={`/tags/${tag.toLowerCase()}`}
              className="px-3 py-1 text-sm rounded-full text-gray-700 
                       hover:bg-[rgba(244,162,97,0.2)] hover:text-[rgba(244,162,97,1)] 
                       dark:text-gray-300 dark:hover:text-[rgba(244,162,97,0.9)] 
                       transition-colors duration-200"
            >
              #{tag}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
};