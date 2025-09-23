import React, { ReactNode } from 'react';

interface NavbarConfig {
  title: string;
  sidebar: any[]; // Or a more specific type if known
}

interface NavbarProps {
  config: NavbarConfig;
  className?: string;
  children?: ReactNode;
}

export const Navbar = ({ config, className }: NavbarProps) => {
  return (
    <nav className={`p-4 ${className || ''}`}>
      <div className="container mx-auto flex justify-between items-center">
        <span className="text-xl font-bold">{config.title}</span>
        {/* Add navigation links or other elements here if needed */}
      </div>
    </nav>
  );
};
