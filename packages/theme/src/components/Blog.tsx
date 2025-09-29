// Blog component file
/// <reference types="react" />
/// <reference types="react-dom" />
import React from 'react';
import { BlogProps, BlogPost } from '../types';
import { Navbar } from './Navbar';
import { BlogSidebar } from './BlogSidebar';
import { Footer } from './Footer';

const BlogPostPreview: React.FC<{ post: BlogPost }> = ({ post }) => {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 pb-8 mb-8 last:border-b-0">
      <h2 className="text-3xl font-bold mb-3">
        <a 
          href={post.path} 
          className="text-gray-900 dark:text-dark-text hover:text-primary dark:hover:text-primary transition-colors duration-200"
        >
          {post.title}
        </a>
      </h2>
      
      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
        <time dateTime={new Date(post.date).toISOString()}>
          {new Date(post.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </time>
        {post.author && (
          <>
            <span className="mx-2">•</span>
            <span>{post.author}</span>
          </>
        )}
      </div>
      
      <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
        {post.excerpt}
      </p>
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {post.tags?.map((tag, idx) => (
            <a
              key={idx}
              href={`/tags/${tag.toLowerCase()}`}
              className="inline-block px-3 py-1 text-sm bg-[rgba(244,162,97,0.2)] 
                       text-[rgba(244,162,97,1)] dark:text-[rgba(244,162,97,0.9)] rounded-full 
                       hover:bg-[rgba(244,162,97,0.3)] dark:bg-[rgba(244,162,97,0.15)] 
                       dark:hover:bg-[rgba(244,162,97,0.25)] transition-colors duration-200"
            >
              #{tag}
            </a>
          ))}
        </div>
        
        <a
          href={post.path}
          className="inline-flex items-center text-[rgba(244,162,97,1)] hover:text-[rgba(244,162,97,0.8)] 
                     dark:text-[rgba(244,162,97,0.8)] dark:hover:text-[rgba(244,162,97,1)] 
                     font-medium transition-colors duration-200"
        >
          Read more
          <svg 
            className="ml-1 w-4 h-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 5l7 7-7 7"
            />
          </svg>
        </a>
      </div>
    </div>
  );
};

const BlogPostCard: React.FC<{ post: BlogPost }> = ({ post }) => {
  return (
    <div className="mb-8 p-6 rounded-lg bg-white dark:glass-nav transition-all duration-300">
      <div className="flex items-center text-sm text-gray-500 dark:text-gray-300 mb-2">
        <time dateTime={new Date(post.date).toISOString()}>
          {new Date(post.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </time>
        <span className="mx-2">·</span>
        <span>{post.readingTime || '2 min read'}</span>
      </div>
      
      <h2 className="text-xl font-semibold mb-2">
        <a 
          href={post.path}
          className="text-gray-900 dark:text-white hover:text-primary dark:hover:text-primary transition-colors duration-200"
        >
          {post.title}
        </a>
      </h2>
      
      {post.excerpt && (
        <p className="text-gray-600 dark:text-gray-200 leading-relaxed">
          {post.excerpt}
        </p>
      )}
      
      {post.tags && post.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {post.tags.map(tag => (
            <a
              key={tag}
              href={`/tags/${tag.toLowerCase()}`}
              className="text-sm text-primary dark:text-primary-light hover:text-primary-dark dark:hover:text-primary"
            >
              #{tag}
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export const Blog: React.FC<BlogProps> = ({
  posts = [],
  title = "DocWalrus Blog",
  children
}) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg transition-colors">
      <Navbar title={title} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 lg:sticky lg:top-8 lg:self-start">
            <div className="p-6 rounded-lg bg-white dark:glass-nav transition-all duration-300">
              <BlogSidebar posts={posts} />
            </div>
          </aside>
          
          <main className="flex-1 max-w-3xl">
            {children}
            <div className="space-y-8">
              {posts.map((post, idx) => (
                <BlogPostCard key={post.slug || idx} post={post} />
              ))}
              
              {posts.length === 0 && (
                <div className="text-center py-12 rounded-lg bg-white dark:glass-nav transition-all duration-300">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No posts yet
                  </h2>
                  <p className="text-gray-600 dark:text-gray-200">
                    Check back soon for new content!
                  </p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};
