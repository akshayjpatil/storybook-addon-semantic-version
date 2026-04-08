# React Example

Example Storybook app for testing `storybook-addon-semantic-version`.

## Prerequisites

- Node.js `>=18`
- npm

## Install

From repo root:

```bash
npm install
cd examples/react
npm install
```

## Run Storybook (dev)

```bash
cd examples/react
npm run storybook
```

Open `http://localhost:6006`.

## Build Example Storybook

```bash
cd examples/react
npm run build-storybook
```

Output goes to:

- `examples/react/storybook-static`

## Build Versioned Storybooks (addon flow)

The addon CLI builds current `package.json` version into `dist/storybooks/<version>` and updates refs/versions metadata.

```bash
cd examples/react
node ../../dist/cli/build-storybooks.js
```

Output goes to:

- `examples/react/dist/root/storybook`
- `examples/react/dist/root/versions.json`
- `examples/react/dist/storybooks/<version>`
- `examples/react/dist/shared`

Generated metadata:

- `examples/react/.storybook/refs.generated.ts`
- `examples/react/.storybook/versions.json`

## Build Multiple Versions Locally

CLI builds one version per run (current `package.json` version). To build multiple versions, set version and run CLI for each:

```bash
cd examples/react
ORIG_VERSION=$(node -p "require('./package.json').version")
for V in 1.0.0 1.1.0 2.0.0; do
  npm pkg set version="$V"
  node ../../dist/cli/build-storybooks.js
done
npm pkg set version="$ORIG_VERSION"
```

## Troubleshooting

- If version switcher click shows `Not Found`, target path likely missing:
  - expected: `/storybooks/<version>/iframe.html`
  - build versioned outputs first (command above)
- If dev server cannot start on `6006`, another process already uses port.
