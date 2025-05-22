import React, { useCallback, useEffect, useState } from 'react';
import { Icons, IconButton, WithTooltip, TooltipLinkList } from '@storybook/components';
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
        setVersions(data.sort());
      })
      .catch(() => console.warn('Could not load versions.json'));
  }, []);

  useEffect(() => {
    if (!selected && versions.length > 0) {
      const latest = versions[versions.length - 1];
      setSelected(latest);
      localStorage.setItem(SELECTED_VERSION_PARAM_KEY, latest)
    }
  }, [versions])

  const handleSelect = (version: string) => {
    setSelected(version);
    localStorage.setItem(SELECTED_VERSION_PARAM_KEY, version);
    const currentStoryId = getCurrentStoryId();
    const targetUrl = `/storybooks/${version}/?path=${currentStoryId}`;
    window.location.href = targetUrl;
  };

  const buildItems = useCallback(() => {
    const latest = versions[versions.length - 1];
    console.log(versions);
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
  }, [versions])

  return (
    <WithTooltip
      placement="top"
      trigger="click"
      tooltip={<TooltipLinkList links={buildItems()} />}
    >
      <IconButton title={`Version: v${selected || 'latest'}`} placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
        <Icons icon="arrowdown" />
        {selected}
      </IconButton>
    </WithTooltip>
  );
};