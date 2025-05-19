#!/usr/bin/env node
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const root = process.cwd();
const pkg = JSON.parse(
  fs.readFileSync(
    new URL(path.join(root, 'package.json'), import.meta.url),
    'utf-8'
  )
);
const version = pkg.version;
const distDir = path.join(root, 'dist');
const versionDir = path.join(distDir, 'storybooks', version);
const rootDir = path.join(distDir, 'root');
const versionsFile = path.join(root, '.storybook', 'versions.json');
const refsFile = path.join(root, '.storybook', 'refs.generated.js');
// Ensure dirs exist
fs.mkdirSync(versionDir, { recursive: true });
fs.mkdirSync(rootDir, { recursive: true });
// 1. Build the current version
console.log(`Building version ${version}...`);
execSync(`npm run build-storybook -- -o ${versionDir}`, {
  stdio: 'inherit',
});

// 2. Update versions.json
let versions: string[] = [];
if (fs.existsSync(versionsFile)) {
  versions = JSON.parse(fs.readFileSync(versionsFile, 'utf-8'));
}
if (!versions.includes(version)) {
  versions.push(version);
  versions.sort();
  fs.writeFileSync(versionsFile, JSON.stringify(versions, null, 2));
  fs.writeFileSync(
    path.join(rootDir, 'versions.json'),
    JSON.stringify(versions, null, 2)
  );
}
// 3. Generate refs
const refs: Record<
  string,
  { title: string; url: string; expanded: boolean; disabled: boolean }
> = {};
versions.forEach((v) => {
  refs[`v${v}`] = {
    title: `v${v}`,
    url: `/storybooks/${v}/`,
    expanded: false,
    disabled: true,
  };
});
const refsJS = `module.exports = ${JSON.stringify(refs, null, 2)};\n`;
fs.writeFileSync(refsFile, refsJS);

// 4. Build root storybook
console.log('Building root storybook...');
execSync(
  `npm run build-storybook -c .storybook -- -o ${path.join(
    rootDir,
    'storybook'
  )}`,
  {
    stdio: 'inherit',
  }
);
console.log(':white_check_mark: All versions built.');
