import fs from 'fs';
import path from 'path';

// Define the SidebarItem interface directly in this file
interface SidebarItem {
  label: string;
  href?: string;
  items?: SidebarItem[];
}

// Helper function to format labels
function formatLabel(name: string): string {
  if (name === 'index') return 'Overview';
  
  return name
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
}

// The generateSidebar function, now self-contained
function generateSidebar(rootDir: string, basePath: string = '/'): SidebarItem[] {
  const sidebar: SidebarItem[] = [];
  
  try {
    const items = fs.readdirSync(rootDir);
    
    // Process directories first
    items
      .filter(item => {
        const itemPath = path.join(rootDir, item);
        return fs.statSync(itemPath).isDirectory() && !item.startsWith('.');
      })
      .forEach(dir => {
        const dirPath = path.join(rootDir, dir);
        const dirItems = generateSidebar(dirPath, `${basePath}${dir}/`);
        
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
        const itemPath = path.join(rootDir, item);
        return fs.statSync(itemPath).isFile() && 
               (item.endsWith('.mdx') || item.endsWith('.md')) && 
               !item.startsWith('.');
      })
      .forEach(file => {
        const { name } = path.parse(file);
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


export async function generateSidebarCommand(pagesDir: string, outputPath: string) {
  try {
    // Ensure the pages directory exists
    if (!fs.existsSync(pagesDir)) {
      console.error(`Pages directory not found: ${pagesDir}`);
      process.exit(1);
    }

    // Generate the sidebar structure
    const sidebar = generateSidebar(pagesDir);

    // Write the sidebar data to a JSON file
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(
      outputPath,
      JSON.stringify(sidebar, null, 2),
      'utf-8'
    );

    console.log(`Sidebar generated successfully: ${outputPath}`);
  } catch (error) {
    console.error('Error generating sidebar:', error);
    process.exit(1);
  }
}