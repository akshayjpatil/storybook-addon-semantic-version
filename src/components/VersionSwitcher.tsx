import React, { useEffect, useState } from 'react';
import semver from 'semver';
import { SELECTED_VERSION_PARAM_KEY, VERSIONS_URL } from '../constants';

/**
 * A native select keeps the manager toolbar usable without relying on deprecated
 * Storybook internal tooltip and link-list components.
 */
export const VersionSwitcher = () => {
  const [versions, setVersions] = useState<string[]>([]);
  const [selected, setSelected] = useState(() =>
    localStorage.getItem(SELECTED_VERSION_PARAM_KEY) || ''
  );

  useEffect(() => {
    fetch(VERSIONS_URL)
      .then((response) => {
        if (!response.ok) throw new Error('Could not load versions.json');
        return response.json();
      })
      .then((data: string[]) => {
        setVersions(data.filter((version) => semver.valid(version)).sort(semver.rcompare));
      })
      .catch(() => console.warn('Could not load versions.json'));
  }, []);

  useEffect(() => {
    if (versions.length === 0) return;
    if (!selected || !versions.includes(selected)) {
      setSelected(versions[0]);
      localStorage.setItem(SELECTED_VERSION_PARAM_KEY, versions[0]);
    }
  }, [versions, selected]);

  const hasVersionBuild = async (version: string) => {
    const url = `/storybooks/${version}/iframe.html`;
    try {
      const headResponse = await fetch(url, { method: 'HEAD' });
      if (headResponse.ok) return true;
      if (headResponse.status === 405) {
        return (await fetch(url, { method: 'GET' })).ok;
      }
      return false;
    } catch {
      return false;
    }
  };

  const handleSelect = async (version: string) => {
    if (!versions.includes(version) || !(await hasVersionBuild(version))) {
      console.warn(`Version build not found for v${version}. Build and serve /storybooks/<version> before switching.`);
      return;
    }

    setSelected(version);
    localStorage.setItem(SELECTED_VERSION_PARAM_KEY, version);
    const path = new URL(window.location.href).searchParams.get('path') || '';
    window.location.href = `/storybooks/${version}/?path=${encodeURIComponent(path)}`;
  };

  if (!versions.length) return null;

  return (
    <select
      aria-label="Storybook version"
      title="Storybook version"
      value={versions.includes(selected) ? selected : versions[0]}
      onChange={(event) => void handleSelect(event.target.value)}
      style={{
        cursor: 'pointer',
        background: 'transparent',
        color: 'inherit',
        border: '1px solid currentColor',
        borderRadius: 4,
        padding: '4px 6px',
        font: 'inherit',
      }}
    >
      {versions.map((version, index) => (
        <option key={version} value={version} style={{ color: '#222' }}>
          {version}{index === 0 ? ' (latest)' : ''}
        </option>
      ))}
    </select>
  );
};
