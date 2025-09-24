import React from 'react';
import { NavbarProps } from '../types';

export const Navbar = ({ title, search = false, version }: NavbarProps) => (
  <nav className="bg-purple-600 text-white p-4 shadow-lg">
    <h1 className="text-xl font-bold">{title}</h1>
    {search && <input type="text" placeholder="Search..." className="ml-4 p-1 rounded" />}
    {version && (
      <select className="ml-4 p-1 rounded">
        {version.map((v) => <option key={v}>{v}</option>)}
      </select>
    )}
  </nav>
);

