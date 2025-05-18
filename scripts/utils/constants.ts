import path from 'path';

export const ROOT_WORKSPACE = process.cwd();
export const DIST_DIR = path.join(ROOT_WORKSPACE, 'dist/storybooks');
export const ROOT_OUTPUT_DIR = path.join(ROOT_WORKSPACE, 'dist/root');

export const ROOT_STORYBOOK_DIR = path.join(ROOT_OUTPUT_DIR, 'storybook');
export const OUTPUT_FILE = path.join(ROOT_OUTPUT_DIR, 'versions.json');
export const REFS_FILE = path.join(ROOT_WORKSPACE, '.storybook/refs.json');
