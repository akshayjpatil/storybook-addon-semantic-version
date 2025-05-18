import chalk from 'chalk';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { DIST_DIR, ROOT_OUTPUT_DIR } from './constants';

export function isStorybookLib(libPath: string): boolean {
  return fs.existsSync(path.join(libPath, 'tsconfig.storybook.json'));
}

export function getLibInfo(): Record<string, string> {
  const pkgPath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(pkgPath)) {
    console.error(chalk.red.bold('ERROR: 404 No package.json found'));
    process.exit(1);
  }
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  if (!pkg.version) {
    console.error(chalk.red.bold('ERROR: No version found in package.json'));
    process.exit(1);
  }
  return { version: pkg.version };
}

export function buildStaticStorybook(version: string): void {
  const outputPath = path.join(DIST_DIR, version);
  try {
    execSync(`npm run build-storybook --output-dir=${outputPath}`, {
      stdio: 'inherit',
    });
  } catch (err) {
    console.error(chalk.red('ERROR: Failed to build storybook:', err));
  }
}

export function copyVersionStorybookToRoot(version: string): void {
  const isWindows = process.platform === 'win32';
  const versionedStorybookPath = path.join(DIST_DIR, version);
  try {
    if (isWindows)
      execSync(
        `xcopy "${versionedStorybookPath}/*" "${ROOT_OUTPUT_DIR}" /E /I`
      );
    else execSync(`cp -r "${versionedStorybookPath} ${ROOT_OUTPUT_DIR}`);
  } catch (err) {
    console.error(
      chalk.red('ERROR: Failed to copy over the built storybook:', err)
    );
  }
}
