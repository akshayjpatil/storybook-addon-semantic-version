import fs from 'fs';
import chalk from 'chalk';
import {
  buildStaticStorybook,
  copyVersionStorybookToRoot,
  getLibInfo,
  OUTPUT_FILE,
  pushAndSortRefObjects,
  pushAndSortVersions,
  REFS_FILE,
} from './utils';

async function main() {
  let versions: Array<string> = [];
  let refs: Array<{ version: string; url: string }> = [];
  const { version } = getLibInfo();
  buildStaticStorybook(version);

  // Track versions
  try {
    versions = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8'));
  } catch (err) {
    console.warn(
      chalk.yellow(
        'WARN: Could not parse existing versions.json. Starting fresh'
      )
    );
  }
  versions = pushAndSortVersions(versions, version);
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(versions, null, 2));
  console.log(chalk.green.bold('✓ COMPLETED: Generating versions.json'));

  // Track refs
  try {
    refs = JSON.parse(fs.readFileSync(REFS_FILE, 'utf-8'));
  } catch (err) {
    console.warn(
      chalk.yellow('WARN: Could not parse existing refs.json. Starting fresh')
    );
  }
  refs = pushAndSortRefObjects(refs, {
    version,
    url: `/storybooks/${version}/`,
  });
  fs.writeFileSync(REFS_FILE, JSON.stringify(refs, null, 2));
  console.log(chalk.green.bold('✓ COMPLETED: Generating refs.json'));

  copyVersionStorybookToRoot(version);
  console.log(chalk.green.bold('✓ COMPLETED: Building Storybook'));
}

main().catch((err) => {
  console.error('Error in build-storybooks.ts:', err);
  process.exit(1);
});
