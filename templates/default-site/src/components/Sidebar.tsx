import React from 'react';
import { SidebarItem } from '../utils/sidebarGenerator';

interface SidebarProps {
  items: SidebarItem[];
  currentPath: string;
}

const Sidebar: React.FC<SidebarProps> = ({ items, currentPath }) => {
  return (
    <div className="w-64 dark:bg-gray-800 bg-gray-50 p-4 h-full overflow-y-auto">
      <nav>
        <ul className="space-y-2">
          {items.map((item, index) => (
            <SidebarItemComponent 
              key={index} 
              item={item} 
              currentPath={currentPath} 
              depth={0} 
            />
          ))}
        </ul>
      </nav>
    </div>
  );
};

interface SidebarItemComponentProps {
  item: SidebarItem;
  currentPath: string;
  depth: number;
}

const SidebarItemComponent: React.FC<SidebarItemComponentProps> = ({ 
  item, 
  currentPath, 
  depth 
}) => {
  const [isOpen, setIsOpen] = React.useState(true);
  const isActive = item.href === currentPath;
  const hasChildren = item.items && item.items.length > 0;
  
  const handleClick = (e: React.MouseEvent) => {
    if (hasChildren) {
      e.preventDefault();
      e.stopPropagation();
      setIsOpen(!isOpen);
    }
  };
  
  return (
    <li className={`pl-${depth * 2}`}>
      <div 
        className={`flex items-center justify-between py-2 px-3 rounded-md ${
          isActive 
            ? 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300' 
            : 'hover:bg-orange-50 dark:hover:bg-orange-800/30 dark:text-gray-200'
        }`}
      >
        {item.href ? (
          <a 
            href={`#${item.href}`} 
            className={`block w-full ${isActive ? 'font-medium' : ''}`}
            onClick={(e) => {
              if (!hasChildren) {
                // Only close menu if it's a leaf node (no children)
                const event = new CustomEvent('closeMobileMenu');
                window.dispatchEvent(event);
              }
            }}
          >
            {item.label}
          </a>
        ) : (
          <span className="font-medium dark:text-gray-200 cursor-pointer w-full" onClick={handleClick}>
            {item.label}
          </span>
        )}
        
        {hasChildren && (
          <button 
            className="p-1"
            onClick={handleClick}
          >
            <svg 
              className={`w-4 h-4 transition-transform ${isOpen ? 'transform rotate-90' : ''}`} 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path 
                fillRule="evenodd" 
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" 
                clipRule="evenodd" 
              />
            </svg>
          </button>
        )}
      </div>
      
      {hasChildren && isOpen && (
        <ul className="ml-4 mt-1 space-y-1">
          {item.items!.map((child, index) => (
            <SidebarItemComponent 
              key={index} 
              item={child} 
              currentPath={currentPath} 
              depth={depth + 1} 
            />
          ))}
        </ul>
      )}
    </li>
  );
};

export default Sidebar;