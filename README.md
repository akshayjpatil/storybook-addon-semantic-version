# Storybook Semantic Version Addon

[![NPM version](https://img.shields.io/npm/v/storybook-addon-semantic-version.svg?style=flat)](https://npmjs.com/package/storybook-addon-semantic-version) [![NPM downloads](https://img.shields.io/npm/dm/storybook-addon-semantic-version.svg?style=flat)](https://npmjs.com/package/storybook-addon-semantic-version)

Storybook addon for managing semantically versioned component libraries. Deploy multiple Storybook versions simultaneously to document component evolution and breaking changes in monorepos.

![Version Switcher Demo](https://raw.githubusercontent.com/akshayjpatil/storybook-addon-semantic-version/main/assets/screenshot.png)

## Features

- 📦 **Multi-version management** - Deploy multiple Storybook versions
- 🔄 **Version switching** - Toolbar dropdown to switch versions
- 📱 **Persistent selection** - Selected version saves to localStorage
- 🏗️ **Monorepo support** - Auto-discover and build from NX monorepos
- 🔗 **Story path preservation** - Navigate between versions while keeping current story view

## Compatibility

| Addon version | Storybook version | Node.js |
|---|---|---|
| `1.x` | `^7.6.20` | ≥16 |
| `2.x` | `>=8 <10` | ≥18 |
| `3.x` | `>=8 <10` | ≥18 |
| `4.x` | `>=8 <11` | ≥18 |

> **Note:** This addon doesn't support hot reloading. Static builds required.

## Getting Started

### Step 1: Install the addon

```bash
npm install storybook-addon-semantic-version
```

or with pnpm:

```bash
pnpm add storybook-addon-semantic-version
```

### Step 2: Register the addon

Update root `.storybook/main.ts`:

```typescript
import { refs } from './refs.generated';

export default {
  refs,
  addons: ['storybook-addon-semantic-version'],
};
```

> **Note:** `refs.generated.ts` is auto-created in step 3. Create manually if needed.

### Step 3: Build versioned Storybooks

Run CLI from project root:

```bash
npx storybook-addon-semantic-version
```

This will:
- Discover all Storybook instances
- Build each with version from `package.json`
- Generate `versions.json`
- Generate `refs.generated.ts`
- Output to `dist/storybooks/<version>/` and `dist/root/`

Folder structure:

```
dist/
├── root/
│   ├── storybook/           # Root Storybook build (with version switcher)
│   └── versions.json        # List of all built versions
└── storybooks/
    ├── 1.0.0/               # Version 1 build
    ├── 1.1.0/               # Version 2 build
    └── 2.0.0/               # Version 3 build
```

### Step 4: Serve locally

```bash
npx http-server dist --cors
```

> **Note:** Install with `npm install -g http-server` if needed.

View at `http://localhost:3000/root/storybook`

### Step 5: Deploy

Deploy `dist/` folder to hosting (S3, GitHub Pages, Vercel, etc.) and configure DNS.

## Important Notes

⚠️ **Persistent Storage:** `dist/` folder must be preserved. If deleted:
1. Clear `refs.generated.ts` from `.storybook/`
2. Clear `versions.json` from `.storybook/`
3. Rebuild from scratch

## Contributing

Found a bug or want to suggest a feature? Check the [issues tab](https://github.com/akshayjpatil/storybook-addon-semantic-version/issues).

## License

MIT
