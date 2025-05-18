# Storybook Semantic Version Deploy

Storybook addon to deploy semantically versioned(Semver) components for each library from your NX monorepo. Read more about semver [here](https://semver.org/).

## Getting started

### 1. Install the package in your NX monorepo root

```shell
npm install storybook-addon-semantic-version
```

OR

```shell
pnpm add storybook-addon-semantic-version
```

### 2. Register the addon in your root Storybook instance

_Note: `.storybook/refs.generated.js` is automatically generated when running step 3. If it throws error create one manually_

```typescript
import { refs } from './refs.generated';

export default {
  refs,
  addons: ['@storybook/addon-essentials', 'storybook-addon-semantic-version'],
};
```

### 3. Generate refs + build Storybooks

Will find all storybook instances within your NX monorepo and then generate static storybook build folder and put in `dist/storybooks/<lib>/<version>`. The version is based on package.json of the `<lib>`.

```shell
npx storybook-addon-semantic-version build-all-storybooks
```

### 4. Build root composed storybook

Step 3. Builds all the libraries' storybooks. Now you need to build the root storybook which will read the `refs.generated.ts`, load all latest version of each library and add toolbar version dropdown for dynamic switching.

```shell
nx run storybook-root:build-storybook --output-dir=dist/root/storybook
```

After building everything this is how your dist folder should look like:

```
dist/
├── root/
│   ├── storybook/         ← static root Storybook build
│   └── versions.json      ← preserved
├── storybooks/
│   └── v1.2.4/            ← library name
```

### 5. Serve it

To test locally you can just run

```shell
npx server dist
```

You should now be able to view your main storybook at `http://localhost:3000/root/storybook`

_Note: You can deploy your entire dist folder to a storage bucket online and make it available through a DNS_

## Contributing:

Take a look at issues tab for contribution.

## License

storybook-addon-semantic-version is MIT licensed
