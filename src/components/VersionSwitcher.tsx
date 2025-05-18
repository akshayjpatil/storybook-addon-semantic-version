import React, { useCallback } from "react";
import { useGlobals } from "@storybook/manager-api"
import { IconButton, TooltipLinkList, WithTooltip } from "@storybook/components";
import { TOOL_ID } from "../constants";


export const VersionSwitcher = () => {
  const [, updateGlobals] = useGlobals()

  console.log('tried')

  const buildLinks = useCallback(() => {
    return [
      {
        id: '1',
        title: 'Option A',
        onclick: () => updateGlobals({ selectedOption: 'A' })
      },
      {
        id: '2',
        title: 'Option B',
        onclick: () => updateGlobals({ selectedOption: 'B' })
      }
    ]
  }, [])

  return (
    <WithTooltip placement="top" trigger={'click'} tooltip={<TooltipLinkList links={buildLinks()} />}>
      <IconButton
        key={TOOL_ID}
        title="Version Dropdown"
        placeholder={undefined}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}>
        ▼
      </IconButton>
    </WithTooltip>
  )
}