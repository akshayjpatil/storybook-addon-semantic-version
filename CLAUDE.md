# CLAUDE.md

**storybook-addon-semantic-version** — Storybook addon managing semantic versioning of component libraries. Deploy & switch between different Storybook versions. Useful for component version history in monorepos.

## Project Overview

**storybook-addon-semantic-version** — Storybook addon managing semantic versioning of component libraries. Deploy & switch between different Storybook versions. Useful for component version history in monorepos.

## Build & Development Commands

**Build addon:**
```bash
npm run build
```

Compiles TypeScript via Rollup (three entry points):
- `register.ts` - Storybook addon registration
- `preset.ts` - Storybook preset configuration
- `cli/build-storybooks.ts` - CLI tool for versioned Storybooks

**Build versioned Storybooks:**
```bash
npm run storybooks:build
```

Or directly:
```bash
npx storybook-addon-semantic-version
```

Main CLI users run. Discovers Storybook instances → builds them → generates `versions.json` & `refs.generated.ts` → outputs to `dist/storybooks/<version>/` and `dist/root/`

**Other commands:**
```bash
npm run build-storybook  # Build current version's Storybook
npm run build-storybook -c .storybook -- -o <dir>  # Build with custom config/output
```

## Architecture

### Three Entry Points (Rollup outputs)

1. **register.ts** - Addon Manager
   - Registers addon with Storybook's addons API
   - Adds `VersionSwitcher` as toolbar TOOL
   - Used in `.storybook/main.ts` via `addons` array

2. **preset.ts** - Storybook Preset
   - Implements `managerEntries` hook
   - Extends manager config to include register entry point
   - Auto-used if addon configured in Storybook

3. **cli/build-storybooks.ts** - CLI Build Script
   - Entry point for `storybook-addon-semantic-version` CLI
   - Orchestrates multi-version builds:
     - Reads package version
     - Builds Storybook → `dist/storybooks/<version>/`
     - Maintains `versions.json` list
     - Generates `refs.generated.ts`
     - Builds root Storybook → `dist/root/storybook/`

### Runtime Component

**VersionSwitcher.tsx** - React toolbar component
- Fetches versions from `/root/versions.json`
- Dropdown all versions
- Highlights latest
- Persists selection in localStorage
- Navigate to selected version, preserve story path

### Key Constants (src/constants.ts)

- `ADDON_ID`: `'storybook-addon-semver'` - Addon ID
- `TOOL_ID`: Storybook toolbar tool registration
- `SELECTED_VERSION_PARAM_KEY`: localStorage key
- `VERSIONS_URL`: `/root/versions.json` - Versions list location

## Build System & Dependencies

**Build Tool:** Rollup
- **Plugins:** TypeScript, node-resolve, commonjs, JSON, peer-deps-external
- **Format:** ESM (preserved modules + sourcemaps)
- **Externals:** react, react-dom (peer deps)

**TypeScript:** Strict mode, targets ES2018, JSX enabled

**Key Dependencies:**
- `@storybook/addons`, `@storybook/components`, `@storybook/manager-api` (peer deps)
- `@storybook/icons` - Toolbar icons
- `chalk` - Terminal colors

## MCP Integration

**GitHub MCP** configured via `.mcp.json`. Use for:
- Repository info queries
- PRs, issues, branches
- GitHub API via MCP

**Setup:** Set `GITHUB_TOKEN` env var:
```bash
export GITHUB_TOKEN=your_token_here
```

Or in `.claude/settings.local.json`:
```json
{
  "env": {
    "GITHUB_TOKEN": "your_token_here"
  }
}
```

Git-ignored for personal settings.

## Important Notes

- **Module Type:** ESM only. Tree-shaking friendly.
- **No Hot Reload:** Addon skips Storybook hot reload. Static builds needed.
- **Monorepo Assumption:** CLI discovers multiple Storybook instances (typically NX).
- **Storage:** Built Storybooks stay in `dist/`. Delete = lose versions.
- **Version Generation:** Versions from library `package.json`.

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