import React, { useCallback, useEffect, useState } from 'react';
import { IconButton, WithTooltip, TooltipLinkList } from 'storybook/internal/components';
import { ChevronDownIcon } from '@storybook/icons';
import semver from 'semver';
import { SELECTED_VERSION_PARAM_KEY, VERSIONS_URL } from '../constants';



export const VersionSwitcher = () => {
  const [versions, setVersions] = useState<string[]>([]);
  const [selected, setSelected] = useState<string>(() => {
    return localStorage.getItem(SELECTED_VERSION_PARAM_KEY) || '';
  });

  const getCurrentStoryId = () => {
    const url = new URL(window.location.href);
    return url.searchParams.get('path') || '';
  }

  useEffect(() => {
    fetch(VERSIONS_URL)
      .then(res => res.json())
      .then((data: string[]) => {
        setVersions(data.sort(semver.rcompare));
      })
      .catch(() => console.warn('Could not load versions.json'));
  }, []);

  useEffect(() => {
    if (!selected && versions.length > 0) {
      const latest = versions[0];
      setSelected(latest);
      localStorage.setItem(SELECTED_VERSION_PARAM_KEY, latest)
    }
  }, [versions])

  const hasVersionBuild = async (version: string) => {
    const probeUrl = `/storybooks/${version}/iframe.html`;

    try {
      const headResponse = await fetch(probeUrl, { method: 'HEAD' });
      if (headResponse.ok) return true;

      // Some static hosts disable HEAD; fallback to GET probe.
      if (headResponse.status === 405) {
        const getResponse = await fetch(probeUrl, { method: 'GET' });
        return getResponse.ok;
      }

      return false;
    } catch {
      return false;
    }
  };

  const handleSelect = async (version: string) => {
    const versionExists = await hasVersionBuild(version);
    if (!versionExists) {
      console.warn(
        `Version build not found for v${version}. Build and serve /storybooks/<version> before switching.`
      );
      return;
    }

    setSelected(version);
    localStorage.setItem(SELECTED_VERSION_PARAM_KEY, version);
    const currentStoryId = getCurrentStoryId();
    const targetUrl = `/storybooks/${version}/?path=${currentStoryId}`;
    window.location.href = targetUrl;
  };

  const buildItems = useCallback(() => {
    if (versions.length === 0) return [];

    const latest = versions[0];
    return versions.map((v) => ({
      id: v,
      title: `v${v}`,
      onClick: () => handleSelect(v),
      active: selected === v,
      right: v === latest ? (
        <div
          style={{
            border: '1px solid limegreen',
            backgroundColor: 'rgba(50, 205, 50, 0.2)',
            color: 'green',
            padding: '0px 6px',
            borderRadius: '50px',
            fontSize: 10
          }}
        >
          latest
        </div>
      ) : undefined
    }))
  }, [versions, selected])

  const latestVersion = versions.length > 0 ? versions[0] : '';
  const isLatestSelected = selected === latestVersion;

  // Don't render if no versions are available (e.g., in dev mode)
  if (versions.length === 0) {
    return null;
  }

  return (
    <WithTooltip
      placement="top"
      trigger="click"
      tooltip={
        <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
          <TooltipLinkList links={buildItems()} />
        </div>
      }
    >
      <IconButton title={`Version: v${selected || 'latest'}`}>
        <ChevronDownIcon />
        {selected}
        {isLatestSelected && (
          <span
            style={{
              fontSize: '10px',
              background: '#0070f3',
              color: '#fff',
              borderRadius: '4px',
              padding: '1px 5px',
              marginLeft: '4px'
            }}
          >
            latest
          </span>
        )}
      </IconButton>
    </WithTooltip>
  );
};
