import { describe, it, expect } from 'vitest';
import semver from 'semver';

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
