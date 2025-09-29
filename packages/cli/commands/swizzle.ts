import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';

interface SwizzleOptions {
  eject: boolean;
}

export async function swizzleComponent(component: string, options: SwizzleOptions): Promise<void> {
  // Check if we're in a DocWalrus project
  const configPath = path.resolve(process.cwd(), 'docwalrus.config.js');
  
  if (!fs.existsSync(configPath)) {
    console.log(chalk.red('Not in a DocWalrus project. Please run this command in a DocWalrus project directory.'));
    process.exit(1);
  }
  
  // List of available components
  const availableComponents = [
    'Navbar',
    'Sidebar',
    'Footer',
    'DocPage',
    'Blog',
    'BlogPost',
    'CodeBlock',
    'SearchBar'
  ];
  
  // Check if component is valid
  if (!availableComponents.includes(component)) {
    console.log(chalk.red(`Component '${component}' not found.`));
    console.log(chalk.blue('Available components:'));
    availableComponents.forEach(c => console.log(chalk.yellow(`- ${c}`)));
    process.exit(1);
  }
  
  // Confirm swizzle
  if (!options.eject) {
    const answers = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `Are you sure you want to swizzle '${component}'? This will copy the component to your project for customization.`,
        default: false
      }
    ]);
    
    if (!answers.confirm) {
      console.log(chalk.blue('Swizzle cancelled.'));
      process.exit(0);
    }
  } else {
    const answers = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `Are you sure you want to eject '${component}'? This will fully copy the component and its dependencies to your project.`,
        default: false
      }
    ]);
    
    if (!answers.confirm) {
      console.log(chalk.blue('Eject cancelled.'));
      process.exit(0);
    }
  }
  
  // Swizzle component
  const spinner = ora(`Swizzling component '${component}'...`).start();
  
  try {
    // Source component path
    const sourceComponentPath = path.resolve(__dirname, `../../../packages/theme/src/components/${component}.tsx`);
    
    if (!fs.existsSync(sourceComponentPath)) {
      spinner.fail(`Component '${component}' not found in theme package.`);
      process.exit(1);
    }
    
    // Destination component path
    const componentsDir = path.resolve(process.cwd(), 'src/components');
    fs.mkdirSync(componentsDir, { recursive: true });
    
    const destComponentPath = path.join(componentsDir, `${component}.tsx`);
    
    // Copy component
    fs.copyFileSync(sourceComponentPath, destComponentPath);
    
    // If ejecting, copy dependencies
    if (options.eject) {
      // Read component file
      const componentContent = fs.readFileSync(sourceComponentPath, 'utf8');
      
      // Extract imports
      const importRegex = /import\s+(?:{[^}]+}\s+from\s+)?['"]([^'"]+)['"]/g;
      let match;
      
      while ((match = importRegex.exec(componentContent)) !== null) {
        const importPath = match[1];
        
        // Only copy local imports
        if (importPath.startsWith('.')) {
          const resolvedImportPath = path.resolve(
            path.dirname(sourceComponentPath),
            importPath
          );
          
          // Check if it's a file or directory
          let sourcePath = resolvedImportPath;
          
          if (!fs.existsSync(`${resolvedImportPath}.tsx`) && !fs.existsSync(`${resolvedImportPath}.ts`)) {
            if (fs.existsSync(`${resolvedImportPath}/index.tsx`)) {
              sourcePath = `${resolvedImportPath}/index.tsx`;
            } else if (fs.existsSync(`${resolvedImportPath}/index.ts`)) {
              sourcePath = `${resolvedImportPath}/index.ts`;
            }
          } else {
            sourcePath = fs.existsSync(`${resolvedImportPath}.tsx`) 
              ? `${resolvedImportPath}.tsx` 
              : `${resolvedImportPath}.ts`;
          }
          
          if (fs.existsSync(sourcePath)) {
            const relativePath = path.relative(path.dirname(sourceComponentPath), sourcePath);
            const destPath = path.join(componentsDir, relativePath);
            
            // Create directory if it doesn't exist
            const destDir = path.dirname(destPath);
            fs.mkdirSync(destDir, { recursive: true });
            
            // Copy file
            fs.copyFileSync(sourcePath, destPath);
          }
        }
      }
    }
    
    spinner.succeed(`Component '${component}' swizzled successfully!`);
    console.log(chalk.blue('\nYou can now customize the component at:'));
    console.log(chalk.yellow(destComponentPath));
    
  } catch (error) {
    spinner.fail(`Failed to swizzle component '${component}'`);
    console.error(error);
    process.exit(1);
  }
}