#!/usr/bin/env node
import { program } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import fs from 'fs-extra';
import path from 'path';
import ora from 'ora';
import updateNotifier from 'update-notifier';
import { execSync } from 'child_process';

// Import commands
import { createSite } from './commands/create';
import { buildSite } from './commands/build';
import { deploySite } from './commands/deploy';
import { startDevServer } from './commands/start';
import { versionDocs } from './commands/version';
import { translateDocs } from './commands/i18n';
import { swizzleComponent } from './commands/swizzle';

// Import package.json
const pkg = require('../../package.json');

// Check for updates
updateNotifier({ pkg }).notify();

// Set up CLI
program
  .name('docwalrus')
  .description('DocWalrus - Documentation Framework')
  .version(pkg.version);

// Create command
program
  .command('create <name>')
  .description('Create a new DocWalrus site')
  .option('-t, --template <template>', 'Template to use', 'default-site')
  .action(async (name, options) => {
    const { createSite } = require('./commands/create');
    await createSite(name, options.template || 'default-site');
  });

// Start command
program
  .command('start')
  .description('Start the development server')
  .option('-p, --port <port>', 'Port to use', '3000')
  .option('-h, --host <host>', 'Host to use', 'localhost')
  .action(async (options) => {
    const { startDevServer } = require('./commands/start');
    await startDevServer(options);
  });

// Build command
program
  .command('build')
  .description('Build the site for production')
  .option('-o, --out <dir>', 'Output directory', 'build')
  .option('--minify', 'Minify the output', true)
  .action(async (options) => {
    const { buildSite } = require('./commands/build');
    await buildSite(options);
  });

// Deploy command
program
  .command('deploy')
  .description('Deploy the site to Walrus')
  .option('-b, --build', 'Build the site before deploying', false)
  .option('-k, --key <key>', 'Private key for SUI wallet')
  .option('-e, --endpoint <endpoint>', 'SUI endpoint', 'https://fullnode.mainnet.sui.io:443')
  .option('--walrus-publisher <url>', 'Walrus publisher URL', 'https://publisher.walrus-testnet.walrus.space/v1/blobs')
  .option('--walrus-aggregator <url>', 'Walrus aggregator URL', 'https://aggregator.walrus-testnet.walrus.space/v1/api')
  .option('--epochs <number>', 'Number of storage epochs', '1')
  .action(async (options) => {
    const { deploySite } = require('./commands/deploy');
    await deploySite({
      ...options,
      epochs: options.epochs ? parseInt(options.epochs) : undefined
    });
  });

// Version command
program
  .command('version <version>')
  .description('Create a new version of the docs')
  .option('-l, --label <label>', 'Label for the version')
  .action(async (version, options) => {
    const { versionDocs } = require('./commands/version');
    await versionDocs(version, options);
  });

// i18n command
program
  .command('i18n <locale>')
  .description('Create translations for a locale')
  .option('-f, --from <locale>', 'Source locale', 'en')
  .action(async (locale, options) => {
    const { translateDocs } = require('./commands/i18n');
    await translateDocs(locale, options);
  });

// Swizzle command
program
  .command('swizzle <component>')
  .description('Customize a theme component')
  .option('-e, --eject', 'Fully eject the component', false)
  .action(async (component, options) => {
    const { swizzleComponent } = require('./commands/swizzle');
    await swizzleComponent(component, options);
  });

// Parse arguments
program.parse(process.argv);

// Show help if no arguments
if (!process.argv.slice(2).length) {
  program.outputHelp();
}