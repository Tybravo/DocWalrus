const fs = require('fs-extra');
const path = require('path');

async function copyTemplates() {
  try {
    const sourceDir = path.resolve(__dirname, '../../templates');
    const destDir = path.resolve(__dirname, 'dist/templates');
    
    console.log(`Copying templates from ${sourceDir} to ${destDir}`);
    
    // Ensure destination directory exists
    await fs.ensureDir(destDir);
    
    // Copy templates
    await fs.copy(sourceDir, destDir, {
      overwrite: true,
      filter: (src) => {
        // Skip node_modules and .git directories
        return !src.includes('node_modules') && !src.includes('.git');
      }
    });
    
    console.log('Templates copied successfully!');
  } catch (error) {
    console.error('Error copying templates:', error);
    process.exit(1);
  }
}

copyTemplates();