import { describe, it, expect, beforeEach, vi } from 'vitest';
import semver from 'semver';
import { SELECTED_VERSION_PARAM_KEY } from '../../constants';

// Test version sorting and selection logic (extracted from VersionSwitcher)
describe('VersionSwitcher version logic', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should sort versions newest-first using semver.rcompare', () => {
    const versions = ['1.0.0', '2.0.0', '1.5.0'];
    const sorted = [...versions].sort(semver.rcompare);

    expect(sorted).toEqual(['2.0.0', '1.5.0', '1.0.0']);
    expect(sorted[0]).toBe('2.0.0');
  });

  it('should identify latest version as first index after semver.rcompare sort', () => {
    const versions = ['1.0.0', '1.5.0', '2.0.0'];
    const sorted = [...versions].sort(semver.rcompare);
    const latest = sorted[0];

    expect(latest).toBe('2.0.0');
  });

  it('should auto-select latest version when no localStorage value exists', () => {
    const versions = ['1.0.0', '1.5.0', '2.0.0'];
    const sorted = [...versions].sort(semver.rcompare);
    const selected = localStorage.getItem(SELECTED_VERSION_PARAM_KEY) || '';

    if (!selected && sorted.length > 0) {
      const latest = sorted[0];
      localStorage.setItem(SELECTED_VERSION_PARAM_KEY, latest);
    }

    expect(localStorage.getItem(SELECTED_VERSION_PARAM_KEY)).toBe('2.0.0');
  });

  it('should not override localStorage if already set', () => {
    localStorage.setItem(SELECTED_VERSION_PARAM_KEY, '1.0.0');
    const versions = ['1.0.0', '1.5.0', '2.0.0'];
    const sorted = [...versions].sort(semver.rcompare);
    const selected = localStorage.getItem(SELECTED_VERSION_PARAM_KEY) || '';

    if (!selected && sorted.length > 0) {
      const latest = sorted[0];
      localStorage.setItem(SELECTED_VERSION_PARAM_KEY, latest);
    }

    expect(localStorage.getItem(SELECTED_VERSION_PARAM_KEY)).toBe('1.0.0');
  });

  it('should determine when to show latest badge (selected === latest)', () => {
    const versions = ['1.0.0', '2.0.0'];
    const sorted = [...versions].sort(semver.rcompare);
    const latestVersion = sorted[0];

    const selected = '2.0.0';
    const shouldShowBadge = selected === latestVersion;

    expect(shouldShowBadge).toBe(true);
  });

  it('should determine when NOT to show latest badge (selected !== latest)', () => {
    const versions = ['1.0.0', '2.0.0'];
    const sorted = [...versions].sort(semver.rcompare);
    const latestVersion = sorted[0];

    const selected = '1.0.0';
    const shouldShowBadge = selected === latestVersion;

    expect(shouldShowBadge).toBe(false);
  });

  it('should handle pre-release versions in sort', () => {
    const versions = ['1.0.0', '1.0.0-rc.1', '1.0.0-alpha'];
    const sorted = [...versions].sort(semver.rcompare);

    expect(sorted[0]).toBe('1.0.0');
    expect(sorted.indexOf('1.0.0-rc.1')).toBeGreaterThan(0);
  });

  it('should correctly order versions with many releases', () => {
    const versions = ['0.1.0', '1.0.0', '1.1.0', '2.0.0', '1.5.0', '0.5.0'];
    const sorted = [...versions].sort(semver.rcompare);

    expect(sorted[0]).toBe('2.0.0');
    expect(sorted[1]).toBe('1.5.0');
    expect(sorted[2]).toBe('1.1.0');
    expect(sorted[3]).toBe('1.0.0');
  });
});
