import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import matter from 'gray-matter';

// Types
interface DocMetadata {
  id: string;
  title: string;
  description?: string;
  sidebar_position?: number;
  tags?: string[];
  [key: string]: any;
}

interface BlogMetadata {
  id: string;
  title: string;
  date: string;
  author?: string;
  tags?: string[];
  excerpt?: string;
  [key: string]: any;
}

interface SidebarItem {
  type: 'doc' | 'category';
  label: string;
  id?: string;
  items?: SidebarItem[];
}

// Load docs from directory
export function loadDocs(docsDir: string): DocMetadata[] {
  const docFiles = glob.sync('**/*.{md,mdx}', { cwd: docsDir });
  
  return docFiles.map(file => {
    const filePath = path.join(docsDir, file);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data } = matter(fileContent);
    
    const id = file.replace(/\.(md|mdx)$/, '');
    
    return {
      id,
      ...data,
      title: data.title || id,
    } as DocMetadata;
  });
}

// Load blog posts
export function loadBlogPosts(blogDir: string): BlogMetadata[] {
  const blogFiles = glob.sync('**/*.{md,mdx}', { cwd: blogDir });
  
  return blogFiles
    .map(file => {
      const filePath = path.join(blogDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const { data, content } = matter(fileContent);
      
      const id = file.replace(/\.(md|mdx)$/, '');
      
      // Generate excerpt if not provided
      let excerpt = data.excerpt;
      if (!excerpt) {
        excerpt = content.trim().split('\n').slice(0, 2).join(' ').substring(0, 150);
        if (excerpt.length === 150) excerpt += '...';
      }
      
      return {
        id,
        ...data,
        title: data.title || id,
        excerpt,
      } as BlogMetadata;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// Generate sidebar from docs
export function generateSidebar(docs: DocMetadata[]): SidebarItem[] {
  // Group docs by directory
  const docsByDir: Record<string, DocMetadata[]> = {};
  
  docs.forEach(doc => {
    const parts = doc.id.split('/');
    const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : '';
    
    if (!docsByDir[dir]) {
      docsByDir[dir] = [];
    }
    
    docsByDir[dir].push(doc);
  });
  
  // Sort docs by sidebar_position or title
  Object.keys(docsByDir).forEach(dir => {
    docsByDir[dir].sort((a, b) => {
      if (a.sidebar_position !== undefined && b.sidebar_position !== undefined) {
        return a.sidebar_position - b.sidebar_position;
      }
      
      if (a.sidebar_position !== undefined) return -1;
      if (b.sidebar_position !== undefined) return 1;
      
      return a.title.localeCompare(b.title);
    });
  });
  
  // Build sidebar
  const rootDocs = docsByDir[''] || [];
  
  const sidebar: SidebarItem[] = rootDocs.map(doc => ({
    type: 'doc',
    label: doc.title,
    id: doc.id,
  }));
  
  // Add categories
  Object.keys(docsByDir)
    .filter(dir => dir !== '')
    .forEach(dir => {
      const categoryDocs = docsByDir[dir];
      const categoryName = dir.split('/').pop() || dir;
      
      sidebar.push({
        type: 'category',
        label: categoryName,
        items: categoryDocs.map(doc => ({
          type: 'doc',
          label: doc.title,
          id: doc.id,
        })),
      });
    });
  
  return sidebar;
}

// Generate versioned docs
export function generateVersionedDocs(docsDir: string, version: string): void {
  const versionedDir = path.join(docsDir, '..', 'versioned_docs', `version-${version}`);
  
  // Create versioned directory
  fs.mkdirSync(versionedDir, { recursive: true });
  
  // Copy all docs to versioned directory
  const docFiles = glob.sync('**/*.{md,mdx}', { cwd: docsDir });
  
  docFiles.forEach(file => {
    const srcPath = path.join(docsDir, file);
    const destPath = path.join(versionedDir, file);
    
    // Create directory if it doesn't exist
    const destDir = path.dirname(destPath);
    fs.mkdirSync(destDir, { recursive: true });
    
    // Copy file
    fs.copyFileSync(srcPath, destPath);
  });
}