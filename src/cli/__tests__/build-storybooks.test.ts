import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import semver from 'semver';
import { copyDirIfNotExists, deduplicateAssets } from '../build-storybooks';

describe('build-storybooks version sorting', () => {
  it('should sort versions newest-first with semver.rcompare', () => {
    const versions = ['1.0.0', '2.0.0', '1.5.0'];
    const sorted = [...versions].sort(semver.rcompare);

    expect(sorted).toEqual(['2.0.0', '1.5.0', '1.0.0']);
    expect(sorted[0]).toBe('2.0.0');
  });

  it('should handle pre-release versions correctly', () => {
    const versions = ['1.0.0', '1.0.0-rc.1', '1.0.0-alpha', '1.1.0'];
    const sorted = [...versions].sort(semver.rcompare);

    // Should be ordered newest-first with stable versions before pre-release
    expect(sorted[0]).toBe('1.1.0');
    expect(sorted[1]).toBe('1.0.0');
    expect(sorted.indexOf('1.0.0-rc.1')).toBeGreaterThan(sorted.indexOf('1.0.0'));
  });

  it('should deduplicate versions before sorting', () => {
    const versions = ['1.0.0', '2.0.0', '1.0.0', '1.5.0'];
    const deduped = [...new Set(versions)];
    const sorted = deduped.sort(semver.rcompare);

    expect(sorted).toEqual(['2.0.0', '1.5.0', '1.0.0']);
    expect(sorted.length).toBe(3);
  });

  it('should identify latest version as first index after sort', () => {
    const versions = ['1.2.3', '2.0.0', '1.0.0', '2.0.0-beta'];
    const sorted = [...versions].sort(semver.rcompare);

    const latest = sorted[0];
    expect(latest).toBe('2.0.0');
  });

  it('should handle complex semver with build metadata', () => {
    const versions = ['1.0.0+build.1', '1.0.0', '1.0.1', '2.0.0-rc.1+build.5'];
    const sorted = [...versions].sort(semver.rcompare);

    // 2.0.0-rc.1 is highest (pre-release of 2.0.0)
    expect(sorted[0]).toBe('2.0.0-rc.1+build.5');
    expect(sorted[1]).toBe('1.0.1');
  });
});

describe('deduplicateAssets and copyDirIfNotExists', () => {
  let tmpDir: string;
  let sharedDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sb-dedup-test-'));
    sharedDir = path.join(tmpDir, 'shared');
    fs.mkdirSync(sharedDir, { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  // --- copyDirIfNotExists tests ---

  it('should copy a directory tree recursively', () => {
    const src = path.join(tmpDir, 'src-tree');
    fs.mkdirSync(path.join(src, 'sub'), { recursive: true });
    fs.writeFileSync(path.join(src, 'a.js'), 'console.log(1)');
    fs.writeFileSync(path.join(src, 'sub', 'b.js'), 'console.log(2)');

    const dest = path.join(tmpDir, 'dest-tree');
    copyDirIfNotExists(src, dest);

    expect(fs.existsSync(path.join(dest, 'a.js'))).toBe(true);
    expect(fs.existsSync(path.join(dest, 'sub', 'b.js'))).toBe(true);
    expect(fs.readFileSync(path.join(dest, 'sub', 'b.js'), 'utf-8')).toBe(
      'console.log(2)'
    );
  });

  it('should skip files that already exist in dest (idempotent copy)', () => {
    const src = path.join(tmpDir, 'src-skip');
    fs.mkdirSync(src, { recursive: true });
    fs.writeFileSync(path.join(src, 'chunk.abc123.js'), 'original');

    const dest = path.join(tmpDir, 'dest-skip');
    fs.mkdirSync(dest, { recursive: true });
    fs.writeFileSync(path.join(dest, 'chunk.abc123.js'), 'already-here');

    copyDirIfNotExists(src, dest);

    // Pre-existing file must NOT be overwritten
    expect(fs.readFileSync(path.join(dest, 'chunk.abc123.js'), 'utf-8')).toBe(
      'already-here'
    );
  });

  // --- deduplicateAssets tests ---

  it('should move all framework dirs to sharedDir and remove from source', () => {
    const outputDir = path.join(tmpDir, 'storybooks', '1.0.0');
    const frameworkDirs = ['sb-manager', 'sb-addons', 'sb-preview', 'sb-common-assets'];
    for (const dir of frameworkDirs) {
      fs.mkdirSync(path.join(outputDir, dir), { recursive: true });
      fs.writeFileSync(path.join(outputDir, dir, 'chunk.js'), `content-${dir}`);
    }
    // Preserve story assets
    fs.mkdirSync(path.join(outputDir, 'assets'), { recursive: true });
    fs.writeFileSync(path.join(outputDir, 'assets', 'story.js'), 'story-content');
    // Minimal HTML files
    fs.writeFileSync(path.join(outputDir, 'index.html'), '<script src="sb-manager/main.js"></script>');
    fs.writeFileSync(path.join(outputDir, 'iframe.html'), '<link href="sb-preview/runtime.css">');

    deduplicateAssets(outputDir, sharedDir);

    // Framework dirs gone from outputDir
    for (const dir of frameworkDirs) {
      expect(fs.existsSync(path.join(outputDir, dir))).toBe(false);
    }
    // Story assets preserved in outputDir
    expect(fs.existsSync(path.join(outputDir, 'assets'))).toBe(true);
    expect(fs.readFileSync(path.join(outputDir, 'assets', 'story.js'), 'utf-8')).toBe('story-content');
    // Framework dirs exist in sharedDir
    for (const dir of frameworkDirs) {
      expect(fs.existsSync(path.join(sharedDir, dir, 'chunk.js'))).toBe(true);
    }
  });

  it('should move favicon.svg and favicon.ico to sharedDir', () => {
    const outputDir = path.join(tmpDir, 'storybooks', '1.0.0');
    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(path.join(outputDir, 'favicon.svg'), '<svg></svg>');
    fs.writeFileSync(path.join(outputDir, 'favicon.ico'), 'ico-binary');
    fs.writeFileSync(path.join(outputDir, 'index.html'), '<link rel="icon" href="favicon.svg">');

    deduplicateAssets(outputDir, sharedDir);

    // Favicons gone from outputDir
    expect(fs.existsSync(path.join(outputDir, 'favicon.svg'))).toBe(false);
    expect(fs.existsSync(path.join(outputDir, 'favicon.ico'))).toBe(false);
    // Favicons exist in sharedDir
    expect(fs.readFileSync(path.join(sharedDir, 'favicon.svg'), 'utf-8')).toBe('<svg></svg>');
    expect(fs.readFileSync(path.join(sharedDir, 'favicon.ico'), 'utf-8')).toBe('ico-binary');
  });

  it('should patch src and href attributes for directories with optional ./ prefix', () => {
    const outputDir = path.join(tmpDir, 'storybooks', '1.0.0');
    fs.mkdirSync(outputDir, { recursive: true });
    for (const dir of ['sb-manager', 'sb-addons', 'sb-preview']) {
      fs.mkdirSync(path.join(outputDir, dir), { recursive: true });
    }
    fs.writeFileSync(
      path.join(outputDir, 'index.html'),
      '<script src="./sb-manager/runtime.js"></script><link href="sb-addons/chunk.css">'
    );
    fs.writeFileSync(
      path.join(outputDir, 'iframe.html'),
      '<script src="sb-preview/main.js"></script>'
    );

    deduplicateAssets(outputDir, sharedDir);

    const indexHtml = fs.readFileSync(path.join(outputDir, 'index.html'), 'utf-8');
    expect(indexHtml).toContain('src="/shared/sb-manager/runtime.js"');
    expect(indexHtml).toContain('href="/shared/sb-addons/chunk.css"');

    const iframeHtml = fs.readFileSync(path.join(outputDir, 'iframe.html'), 'utf-8');
    expect(iframeHtml).toContain('src="/shared/sb-preview/main.js"');
  });

  it('should patch favicon href attributes in HTML', () => {
    const outputDir = path.join(tmpDir, 'storybooks', '1.0.0');
    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(path.join(outputDir, 'favicon.svg'), '<svg></svg>');
    fs.writeFileSync(
      path.join(outputDir, 'index.html'),
      '<link rel="icon" href="./favicon.svg"><link rel="apple-touch-icon" href="favicon.ico">'
    );

    deduplicateAssets(outputDir, sharedDir);

    const indexHtml = fs.readFileSync(path.join(outputDir, 'index.html'), 'utf-8');
    expect(indexHtml).toContain('href="/shared/favicon.svg"');
    expect(indexHtml).toContain('href="/shared/favicon.ico"');
  });

  it('should be idempotent: calling deduplicateAssets twice does not error or double-patch', () => {
    const outputDir = path.join(tmpDir, 'storybooks', '1.0.0');
    fs.mkdirSync(outputDir, { recursive: true });
    fs.mkdirSync(path.join(outputDir, 'sb-manager'), { recursive: true });
    fs.writeFileSync(path.join(outputDir, 'sb-manager', 'chunk.abc.js'), 'data');
    fs.writeFileSync(path.join(outputDir, 'index.html'), '<script src="sb-manager/chunk.abc.js"></script>');

    deduplicateAssets(outputDir, sharedDir);

    // Second call — sb-manager is already gone from outputDir, sharedDir already has the file
    expect(() => deduplicateAssets(outputDir, sharedDir)).not.toThrow();

    // HTML is already patched; applying regex again should not produce /shared/shared/
    const html = fs.readFileSync(path.join(outputDir, 'index.html'), 'utf-8');
    expect(html).toBe('<script src="/shared/sb-manager/chunk.abc.js"></script>');
    expect(html).not.toContain('/shared/shared/');
  });

  it('should handle outputDir with no framework dirs gracefully', () => {
    const outputDir = path.join(tmpDir, 'storybooks', 'no-framework');
    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(path.join(outputDir, 'index.html'), '<html></html>');

    expect(() => deduplicateAssets(outputDir, sharedDir)).not.toThrow();
    expect(fs.readFileSync(path.join(outputDir, 'index.html'), 'utf-8')).toBe('<html></html>');
  });

  it('should handle outputDir with no HTML files gracefully', () => {
    const outputDir = path.join(tmpDir, 'storybooks', 'no-html');
    fs.mkdirSync(path.join(outputDir, 'sb-manager'), { recursive: true });
    fs.writeFileSync(path.join(outputDir, 'sb-manager', 'x.js'), 'x');

    expect(() => deduplicateAssets(outputDir, sharedDir)).not.toThrow();
    expect(fs.existsSync(path.join(sharedDir, 'sb-manager', 'x.js'))).toBe(true);
  });
});
