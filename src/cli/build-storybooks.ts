#!/usr/bin/env node
import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import semver from 'semver';
import { fileURLToPath } from 'url';

const distDir = path.join(process.cwd(), 'dist');
const sharedDir = path.join(distDir, 'shared');
const SHARED_DIRS = ['sb-manager', 'sb-addons', 'sb-preview', 'sb-common-assets'] as const;
const SHARED_FILES = ['favicon.svg', 'favicon.ico'] as const;

function getNpmCommand(platform: NodeJS.Platform = process.platform): string {
  return platform === 'win32' ? 'npm.cmd' : 'npm';
}

function copyDirIfNotExists(src: string, dest: string): void {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirIfNotExists(srcPath, destPath);
    } else if (!fs.existsSync(destPath)) {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function deduplicateAssets(outputDir: string, targetSharedDir: string = sharedDir): void {
  // Move shared framework directories
  for (const dir of SHARED_DIRS) {
    const src = path.join(outputDir, dir);
    if (fs.existsSync(src)) {
      copyDirIfNotExists(src, path.join(targetSharedDir, dir));
      fs.rmSync(src, { recursive: true, force: true });
    }
  }
  // Move shared root-level static files (favicon etc.)
  for (const file of SHARED_FILES) {
    const src = path.join(outputDir, file);
    const dest = path.join(targetSharedDir, file);
    if (fs.existsSync(src) && !fs.existsSync(dest)) {
      fs.copyFileSync(src, dest);
    }
    if (fs.existsSync(src)) fs.rmSync(src);
  }
  // Patch HTML entry points to use /shared/ absolute paths
  const sharedDirNames = SHARED_DIRS.join('|');
  const sharedFileNames = SHARED_FILES.map(f => f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const DIR_PATTERN = new RegExp(`(src|href)="(?:\\./)?((${sharedDirNames})/)`, 'g');
  const FILE_PATTERN = new RegExp(`(href)="(?:\\./)?((${sharedFileNames}))"`, 'g');
  for (const htmlFile of ['index.html', 'iframe.html']) {
    const htmlPath = path.join(outputDir, htmlFile);
    if (fs.existsSync(htmlPath)) {
      const original = fs.readFileSync(htmlPath, 'utf-8');
      let patched = original.replace(DIR_PATTERN, '$1="/shared/$2');
      patched = patched.replace(FILE_PATTERN, '$1="/shared/$2"');
      if (patched !== original) fs.writeFileSync(htmlPath, patched, 'utf-8');
    }
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = process.cwd();
  const pkg = JSON.parse(
    fs.readFileSync(
      new URL(path.join(root, 'package.json'), import.meta.url),
      'utf-8'
    )
  );
  const version = pkg.version;
  const versionDir = path.join(distDir, 'storybooks', version);
  const rootDir = path.join(distDir, 'root');
  const versionsFile = path.join(root, '.storybook', 'versions.json');
  const refsFile = path.join(root, '.storybook', 'refs.generated.ts');
  // Ensure dirs exist
  fs.mkdirSync(versionDir, { recursive: true });
  fs.mkdirSync(rootDir, { recursive: true });
  fs.mkdirSync(sharedDir, { recursive: true });
  const npmCommand = getNpmCommand();
  // 1. Build the current version
  console.log(`Building version ${version}...`);
  execFileSync(npmCommand, ['run', 'build-storybook', '--', '-o', versionDir], {
    stdio: 'inherit',
  });
  deduplicateAssets(versionDir);

  // 2. Update versions.json
  let versions: string[] = [];
  if (fs.existsSync(versionsFile)) {
    versions = JSON.parse(fs.readFileSync(versionsFile, 'utf-8'));
  }
  if (!versions.includes(version)) {
    versions.push(version);
    versions.sort(semver.rcompare);
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
  const refsJS = `export default ${JSON.stringify(refs, null, 2)};\n`;
  fs.writeFileSync(refsFile, refsJS);

  // 4. Build root storybook
  console.log('Building root storybook...');
  execFileSync(
    npmCommand,
    ['run', 'build-storybook', '-c', '.storybook', '--', '-o', path.join(rootDir, 'storybook')],
    {
      stdio: 'inherit',
    }
  );
  deduplicateAssets(path.join(rootDir, 'storybook'));
  console.log(':white_check_mark: All versions built.');
}

export { copyDirIfNotExists, deduplicateAssets, getNpmCommand };
