import React from 'react';
import { BlogProps } from '../types';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export const Blog = ({ children, posts }: BlogProps) => (
  <div className="min-h-screen flex flex-col">
    <Navbar title="Blog" />
    <main className="p-4">
      {posts && (
        <ul>
          {posts.map((post, i) => (
            <li key={i} className="mb-4">
              <a href={post.path}>{post.title}</a> - {post.date} - {post.excerpt}
            </li>
          ))}
        </ul>
      )}
      {children}
    </main>
    <Footer />
  </div>
);
