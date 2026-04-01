# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**storybook-addon-semantic-version** is a Storybook addon that manages semantic versioning of component libraries. It enables deploying and switching between different versions of Storybook instances, useful for maintaining component version history in monorepos.

## Build & Development Commands

**Build the addon:**
```bash
npm run build
```

Compiles TypeScript using Rollup with three entry points:
- `register.ts` - Storybook addon registration
- `preset.ts` - Storybook preset configuration
- `cli/build-storybooks.ts` - CLI tool for building versioned Storybooks

**Build all versioned Storybooks:**
```bash
npm run storybooks:build
```

Or directly:
```bash
npx storybook-addon-semantic-version
```

This is the primary CLI command users run. It:
1. Discovers all Storybook instances
2. Builds them with `build-storybook`
3. Generates `versions.json` and `refs.generated.ts`
4. Outputs to `dist/storybooks/<version>/` and `dist/root/`

**Other commands referenced in the addon:**
```bash
npm run build-storybook  # Build current version's Storybook
npm run build-storybook -c .storybook -- -o <dir>  # Build with custom config/output
```

## Architecture

### Three Main Entry Points (Rollup outputs)

1. **register.ts** - Addon Manager Registration
   - Registers the addon with Storybook's addons API
   - Adds the `VersionSwitcher` component as a TOOL in the toolbar
   - Used in `.storybook/main.ts` via `addons` array

2. **preset.ts** - Storybook Preset Configuration
   - Implements the `managerEntries` hook
   - Extends Storybook's manager configuration to include the register entry point
   - Used automatically if addon is configured in Storybook

3. **cli/build-storybooks.ts** - CLI Build Script
   - Entry point for the `storybook-addon-semantic-version` CLI command
   - Orchestrates building multiple versioned Storybooks:
     - Reads current package version
     - Builds Storybook to `dist/storybooks/<version>/`
     - Maintains `versions.json` list of all built versions
     - Generates `refs.generated.ts` with refs object for Storybook
     - Builds root Storybook to `dist/root/storybook/`

### Runtime Component

**VersionSwitcher.tsx** - React toolbar component
- Fetches available versions from `/root/versions.json`
- Displays dropdown with all versions
- Highlights latest version
- Persists selected version in localStorage
- Navigates to selected version while preserving current story path

### Key Constants (src/constants.ts)

- `ADDON_ID`: `'storybook-addon-semver'` - Addon identifier
- `TOOL_ID`: Used for Storybook toolbar tool registration
- `SELECTED_VERSION_PARAM_KEY`: localStorage key for selected version
- `VERSIONS_URL`: `/root/versions.json` - Where versions list is served

## Build System & Dependencies

**Build Tool:** Rollup
- **Plugins:** TypeScript, node-resolve, commonjs, JSON, peer-deps-external
- **Format:** ESM (ES modules) with preserved modules and sourcemaps
- **Externals:** react, react-dom (peer dependencies)

**TypeScript:** Strict mode enabled, targets ES2018, JSX enabled

**Key Dependencies:**
- `@storybook/addons`, `@storybook/components`, `@storybook/manager-api` (peer deps)
- `@storybook/icons` - Icon components for toolbar
- `chalk` - Terminal output colors

## MCP Integration

**GitHub MCP** is configured for this project via `.mcp.json`. You can use GitHub-related commands to:
- Query repository information
- View pull requests, issues, and branches
- Interact with GitHub API via MCP

**Setup:** Set the `GITHUB_TOKEN` environment variable with a personal access token:
```bash
export GITHUB_TOKEN=your_token_here
```

Or set it in `.claude/settings.local.json`:
```json
{
  "env": {
    "GITHUB_TOKEN": "your_token_here"
  }
}
```

The `.claude/settings.local.json` file is git-ignored for personal settings.

## Important Notes

- **Module Type:** ESM only (no CommonJS). Tree-shaking friendly.
- **No Hot Reload:** The addon doesn't support Storybook's hot reloading. Static builds are required for proper version viewing.
- **Monorepo Assumption:** CLI script expects to find multiple Storybook instances via discovery (typically NX monorepos).
- **Storage:** Built Storybooks must be preserved in `dist/` folder. Deleting it will lose all previous versions.
- **Version Generation:** Versions are discovered from `package.json` of the library being built.

## File Structure

```
src/
├── register.ts              # Addon registration
├── preset.ts                # Storybook preset hook
├── constants.ts             # Shared constants
├── cli/
│   └── build-storybooks.ts  # CLI entry point
├── components/
│   ├── VersionSwitcher.tsx  # Toolbar UI component
│   └── index.ts             # Export index
dist/                         # Build output (ESM modules + sourcemaps)
.storybook/
├── refs.generated.ts        # Auto-generated refs (created by build)
└── versions.json            # Auto-generated versions list
rollup.config.js             # Rollup configuration
tsconfig.json                # TypeScript configuration
```
