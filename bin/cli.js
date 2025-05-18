#!/usr/bin/env node

const { default: chalk } = require('chalk');
const { execSync } = require('child_process');
const path = require('path');

const command = process.argv[2];

if (command === 'build-all-storybooks') {
  const scriptPath = path.resolve(__dirname, '../dist/scripts/build-all-storybooks.js');
  console.log(chalk.blue.bold('Building all versioned components for storybook'))
  execSync(`node ${scriptPath}`, { stdio: 'inherit' });
} else {
  console.error(chalk.red(`Unknown command: ${command}`));
}
process.exit(0);