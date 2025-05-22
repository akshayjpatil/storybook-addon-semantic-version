import React, { useCallback, useEffect } from 'react';
import { Icons, IconButton, WithTooltip, TooltipLinkList } from '@storybook/components';
import { AVAILABLE_VERSIONS_PARAM_KEY, SELECTED_VERSION_PARAM_KEY, TOOL_ID, VERSIONS_URL } from '../constants';
import { useGlobals } from '@storybook/manager-api';



export const VersionSwitcher = () => {
  const [globals, updateGlobals] = useGlobals();
  const selectedVersion = globals[SELECTED_VERSION_PARAM_KEY];
  const setSelectedVersion = (version: string) => updateGlobals({ [SELECTED_VERSION_PARAM_KEY]: version })
  const versions = globals[AVAILABLE_VERSIONS_PARAM_KEY];
  const setVersions = (versions: Array<string>) => updateGlobals({ [AVAILABLE_VERSIONS_PARAM_KEY]: versions })

  const getCurrentStoryId = () => {
    const url = new URL(window.location.href);
    return url.searchParams.get('path') || '';
  }

  useEffect(() => {
    fetch(VERSIONS_URL)
      .then(res => res.json())
      .then((data: string[]) => {
        setVersions(data.sort());
      })
      .catch(() => console.warn('Could not load versions.json'));
  }, []);

  useEffect(() => {
    if (!selectedVersion && versions.length > 0) {
      const latest = versions[versions.length - 1];
      setSelectedVersion(latest);
    }
  }, [versions])

  const handleSelect = (version: string) => {
    setSelectedVersion(version);
    const currentStoryId = getCurrentStoryId();
    const targetUrl = `/storybooks/${version}/?path=${currentStoryId}`;
    window.location.href = targetUrl;
  };

  const buildItems = useCallback(() => {
    const latest = versions[versions.length - 1];
    return versions.map((v: string) => ({
      id: v,
      title: `v${v}`,
      onClick: () => handleSelect(v),
      active: selectedVersion === v,
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
  }, [versions])

  return (
    <WithTooltip
      key={TOOL_ID}
      placement="top"
      trigger="click"
      tooltip={<TooltipLinkList links={buildItems()} />}
    >
      <IconButton
        title={`Version: v${selectedVersion || 'latest'}`}
        placeholder={''}
        onPointerEnterCapture={() => { }}
        onPointerLeaveCapture={() => { }}
      >
        <Icons icon="arrowdown" />
        {selectedVersion}
      </IconButton>
    </WithTooltip>
  );
};