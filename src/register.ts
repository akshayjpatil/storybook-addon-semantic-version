import { VersionSwitcher } from './components';
import { addons, types } from '@storybook/addons';
import { ADDON_ID, TOOL_ID } from './constants';

addons.register(ADDON_ID, () => {
  addons.add(TOOL_ID, {
    type: types.TOOL,
    title: 'Version Addon',
    render: VersionSwitcher,
  });
});
