#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Main function to create a new DocWalrus site
async function createDocWalrusSite() {
  console.log('🐘 Welcome to DocWalrus - Documentation Framework');
  console.log('------------------------------------------------');
  
  // Get site name
  const siteName = (process.argv[2] || await promptUser('Enter your site name: ')) as string;
  const template = process.argv[3] || await promptUser('Choose a template (standard, minimal, blog): ', 'standard');
  
  console.log(`\nCreating a new DocWalrus site: ${siteName} with template: ${template}`);
  
  // Create directory structure
  const siteDir = path.resolve(process.cwd(), siteName);
  
  if (fs.existsSync(siteDir)) {
    console.log(`\n⚠️ Directory ${siteName} already exists. Please choose a different name or delete the existing directory.`);
    process.exit(1);
  }
  
  // Create site directory
  fs.mkdirSync(siteDir, { recursive: true });
  
  // Copy template files
  const templateDir = path.resolve(__dirname, '../../templates/default-site');
  copyDirectory(templateDir, siteDir);
  
  // Update package.json
  const packageJsonPath = path.join(siteDir, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  packageJson.name = siteName;
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  
  // Create docs directory
  const docsDir = path.join(siteDir, 'docs');
  fs.mkdirSync(docsDir, { recursive: true });
  
  // Create initial docs
  fs.writeFileSync(
    path.join(docsDir, 'intro.md'),
    `---
title: Introduction
sidebar_position: 1
---

# Introduction

Welcome to ${siteName}! This is your first document.
`
  );
  
  // Create sidebars.js
  fs.writeFileSync(
    path.join(siteDir, 'sidebars.js'),
    `module.exports = {
  docs: [
    {
      type: 'category',
      label: 'Getting Started',
      items: ['intro'],
    },
  ],
};
`
  );
  
  console.log('\n✅ Site created successfully!');
  console.log('\nNext steps:');
  console.log(`1. cd ${siteName}`);
  console.log('2. npm install (or yarn install)');
  console.log('3. npm start (or yarn start)');
  console.log('\nHappy documenting with DocWalrus! 🐘');
  
  rl.close();
}

// Helper function to prompt user
function promptUser(question: string, defaultValue: string = '') {
  return new Promise<string>((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer || defaultValue);
    });
  });
}

// Helper function to copy directory recursively
function copyDirectory(source: string, destination: string) {
  // Create destination directory
  fs.mkdirSync(destination, { recursive: true });
  
  // Get all files and directories in source
  const entries = fs.readdirSync(source, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(source, entry.name);
    const destPath = path.join(destination, entry.name);
    
    if (entry.isDirectory()) {
      // Recursively copy directory
      copyDirectory(srcPath, destPath);
    } else {
      // Copy file
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Run the main function
createDocWalrusSite().catch(console.error);