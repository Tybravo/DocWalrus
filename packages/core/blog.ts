import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { glob } from 'glob';
import { BlogPost, BlogCategory } from '../theme/src/types';

// Validate blog post frontmatter
function validateFrontmatter(data: any, filePath: string): void {
  const required = ['title', 'date', 'author'];
  const missing = required.filter(field => !data[field]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required frontmatter fields: ${missing.join(', ')} in ${filePath}`
    );
  }
}

export function calculateReadingTime(content: string): string {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
}

export function generateExcerpt(content: string, maxLength: number = 150): string {
  const excerpt = content
    .replace(/[#*`]/g, '') // Remove markdown syntax
    .split('\n')
    .filter(line => line.trim() !== '')
    .slice(0, 2)
    .join(' ')
    .trim();

  if (excerpt.length <= maxLength) return excerpt;
  return excerpt.slice(0, maxLength) + '...';
}

export function categorizeByYear(posts: BlogPost[]): BlogCategory[] {
  const postsByYear = posts.reduce((acc, post) => {
    const year = new Date(post.date).getFullYear();
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(post);
    return acc;
  }, {} as Record<number, BlogPost[]>);

  return Object.entries(postsByYear)
    .map(([year, posts]) => ({
      name: year,
      count: posts.length,
      posts: posts
    }))
    .sort((a, b) => Number(b.name) - Number(a.name));
}

export function processBlogPosts(blogDir: string): BlogPost[] {
  if (!fs.existsSync(blogDir)) {
    throw new Error(`Blog directory does not exist: ${blogDir}`);
  }

  // Find all markdown files
  const files = glob.sync('**/*.{md,mdx}', { cwd: blogDir });
  
  const posts = files.map(file => {
    const filePath = path.join(blogDir, file);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContent);
    
    // Validate frontmatter
    validateFrontmatter(data, filePath);
    
    // Generate path from filename
    const slug = file.replace(/\.(md|mdx)$/, '');
    const urlPath = `/blog/${slug}`;
    
    // Process date to ensure consistent format
    const date = new Date(data.date).toISOString().split('T')[0];
    
    return {
      title: data.title,
      date: date,
      author: data.author,
      tags: data.tags || [],
      path: urlPath,
      content: content,
      excerpt: data.excerpt || generateExcerpt(content),
      readingTime: calculateReadingTime(content),
      slug: slug,
      lastModified: fs.statSync(filePath).mtime.toISOString().split('T')[0]
    } as BlogPost;
  });
  
  // Sort posts by date (newest first)
  return posts.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function validateBlogStructure(blogDir: string): void {
  if (!fs.existsSync(blogDir)) {
    throw new Error(`Blog directory does not exist: ${blogDir}`);
  }

  const files = glob.sync('**/*.{md,mdx}', { cwd: blogDir });
  
  if (files.length === 0) {
    throw new Error('No blog posts found. Create .md or .mdx files in the blog directory.');
  }

  files.forEach(file => {
    const filePath = path.join(blogDir, file);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    try {
      const { data } = matter(fileContent);
      validateFrontmatter(data, filePath);
    } catch (error: unknown) {
      // Type guard for error object
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Invalid blog post at ${filePath}: ${errorMessage}`);
    }
  });
}