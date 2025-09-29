import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import glob from 'glob';

interface I18nOptions {
  from: string;
}

export async function translateDocs(locale: string, options: I18nOptions): Promise<void> {
  // Check if we're in a DocWalrus project
  const configPath = path.resolve(process.cwd(), 'docwalrus.config.js');
  
  if (!fs.existsSync(configPath)) {
    console.log(chalk.red('Not in a DocWalrus project. Please run this command in a DocWalrus project directory.'));
    process.exit(1);
  }
  
  // Check if source locale exists
  const sourceDocsDir = path.resolve(process.cwd(), options.from === 'en' ? 'docs' : `i18n/${options.from}/docusaurus-plugin-content-docs/current`);
  
  if (!fs.existsSync(sourceDocsDir)) {
    console.log(chalk.red(`Source locale '${options.from}' not found.`));
    process.exit(1);
  }
  
  // Create i18n directory structure
  const i18nDir = path.resolve(process.cwd(), 'i18n');
  const localeDir = path.join(i18nDir, locale);
  const localeDocsDir = path.join(localeDir, 'docusaurus-plugin-content-docs/current');
  const localeBlogDir = path.join(localeDir, 'docusaurus-plugin-content-blog');
  
  fs.mkdirSync(localeDocsDir, { recursive: true });
  fs.mkdirSync(localeBlogDir, { recursive: true });
  
  // Copy docs
  const spinner = ora(`Creating translations for locale '${locale}'...`).start();
  
  try {
    // Copy docs
    const docFiles = glob.sync('**/*.{md,mdx}', { cwd: sourceDocsDir });
    
    for (const file of docFiles) {
      const sourcePath = path.join(sourceDocsDir, file);
      const destPath = path.join(localeDocsDir, file);
      
      // Create directory if it doesn't exist
      const destDir = path.dirname(destPath);
      fs.mkdirSync(destDir, { recursive: true });
      
      // Copy file
      fs.copyFileSync(sourcePath, destPath);
    }
    
    // Copy blog if it exists
    const sourceBlogDir = path.resolve(process.cwd(), 'blog');
    
    if (fs.existsSync(sourceBlogDir)) {
      const blogFiles = glob.sync('**/*.{md,mdx}', { cwd: sourceBlogDir });
      
      for (const file of blogFiles) {
        const sourcePath = path.join(sourceBlogDir, file);
        const destPath = path.join(localeBlogDir, file);
        
        // Create directory if it doesn't exist
        const destDir = path.dirname(destPath);
        fs.mkdirSync(destDir, { recursive: true });
        
        // Copy file
        fs.copyFileSync(sourcePath, destPath);
      }
    }
    
    // Create code.json for translations
    const codeJsonPath = path.join(localeDir, 'code.json');
    await fs.writeJSON(codeJsonPath, {}, { spaces: 2 });
    
    spinner.succeed(`Translations for locale '${locale}' created successfully!`);
    console.log(chalk.blue('\nNext steps:'));
    console.log(chalk.yellow(`1. Translate the files in i18n/${locale}/`));
    console.log(chalk.yellow('2. Add the locale to your docwalrus.config.js:'));
    console.log(chalk.gray(`
module.exports = {
  // ...
  i18n: {
    defaultLocale: 'en',
    locales: ['en', '${locale}'],
    localeConfigs: {
      en: {
        label: 'English',
      },
      ${locale}: {
        label: '${locale.toUpperCase()}',
      },
    },
  },
  // ...
};
`));
    
  } catch (error) {
    spinner.fail(`Failed to create translations for locale '${locale}'`);
    console.error(error);
    process.exit(1);
  }
}