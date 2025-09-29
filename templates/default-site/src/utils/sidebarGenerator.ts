
export interface SidebarItem {
  label: string;
  href?: string;
  items?: SidebarItem[];
}

// This will be populated with the generated sidebar data
export let sidebarData: SidebarItem[] = [];

// Function to load sidebar data (can be called when needed)
export async function loadSidebarData(): Promise<SidebarItem[]> {
  try {
    // Import the generated JSON file
    const response = await import('../data/sidebar.json');
    sidebarData = response.default || response;
    return sidebarData;
  } catch (error) {
    console.error('Failed to load sidebar data:', error);
    return [];
  }
}

// Helper function to format labels
export function formatLabel(name: string): string {
  if (name === 'index') return 'Overview';
  
  return name
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
}

// Client-side function to generate sidebar from page metadata
export function generateSidebarFromPageData(pages: Array<{ path: string; title: string }>): SidebarItem[] {
  const sidebar: SidebarItem[] = [];
  const pathMap: Record<string, SidebarItem> = {};
  
  const sortedPages = [...pages].sort((a, b) => a.path.localeCompare(b.path));
  
  sortedPages.forEach(page => {
    const pathParts = page.path.split('/').filter(part => part);
    
    let currentLevel = sidebar;
    let currentPath = '';
    
    for (let i = 0; i < pathParts.length; i++) {
      const part = pathParts[i];
      const isLastPart = i === pathParts.length - 1;
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      
      let existingItem = currentLevel.find(item => 
        item.label.toLowerCase() === formatLabel(part).toLowerCase()
      );
      
      if (!existingItem) {
        existingItem = {
          label: isLastPart ? page.title : formatLabel(part),
          href: isLastPart ? page.path : undefined,
          items: []
        };
        currentLevel.push(existingItem);
      }
      
      if (existingItem.items && !isLastPart) {
        currentLevel = existingItem.items;
      }
    }
  });
  
  return sidebar;
}
