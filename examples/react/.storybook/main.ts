import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  // refs are only included for production builds with versioned storybooks
  // In dev mode, refs are empty to avoid loading non-existent built storybooks
  refs: {},
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    'storybook-addon-semantic-version',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  staticDirs: ['../public'],
  docs: {
    autodocs: 'tag',
  },
};
export default config;
