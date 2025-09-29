import { readdirSync, statSync } from 'fs';
import { join, parse } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export interface SidebarItem {
  label: string;
  href?: string;
  items?: SidebarItem[];
}

function formatLabel(name: string): string {
  if (name === 'index') return 'Overview';
  
  return name
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
}

function generateSidebarFromFiles(rootDir: string, basePath: string = '/'): SidebarItem[] {
  const sidebar: SidebarItem[] = [];
  
  try {
    const items = readdirSync(rootDir);
    
    // Process directories first
    items
      .filter(item => {
        const itemPath = join(rootDir, item);
        return statSync(itemPath).isDirectory() && !item.startsWith('.');
      })
      .forEach(dir => {
        const dirPath = join(rootDir, dir);
        const dirItems = generateSidebarFromFiles(dirPath, `${basePath}${dir}/`);
        
        if (dirItems.length > 0) {
          sidebar.push({
            label: formatLabel(dir),
            items: dirItems
          });
        }
      });
    
    // Then process MDX files
    items
      .filter(item => {
        const itemPath = join(rootDir, item);
        return statSync(itemPath).isFile() && 
               (item.endsWith('.mdx') || item.endsWith('.md')) && 
               !item.startsWith('.');
      })
      .forEach(file => {
        const { name } = parse(file);
        const href = name === 'index' ? basePath : `${basePath}${name}`;
        
        sidebar.push({
          label: formatLabel(name),
          href
        });
      });
  } catch (error) {
    console.error('Error generating sidebar:', error);
  }
  
  return sidebar;
}

// Generate sidebar data
const pagesDir = join(__dirname, '../src/pages');
const sidebarData = generateSidebarFromFiles(pagesDir);

// Write to JSON file
import { writeFileSync } from 'fs';
const outputPath = join(__dirname, '../src/data/sidebar.json');
writeFileSync(outputPath, JSON.stringify(sidebarData, null, 2), 'utf-8');

console.log('Sidebar generated successfully:', outputPath);