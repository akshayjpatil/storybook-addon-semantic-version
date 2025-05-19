import json from '@rollup/plugin-json';
import typescript from '@rollup/plugin-typescript';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: {
    'register': 'src/register.ts',
    'preset': 'src/preset.ts',
    'cli/build-storybooks': 'src/cli/build-storybooks.ts'
  },
  output: {
    dir: 'dist',
    format: 'esm',
    preserveModules: true,
    sourcemap: true,
  },
  plugins: [
    peerDepsExternal(),
    nodeResolve(),
    commonjs(),
    json(),
    typescript({ tsconfig: './tsconfig.json' }),
  ],
  external: ['react', 'react-dom']
};
