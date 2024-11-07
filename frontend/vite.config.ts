import path from 'node:path';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import browserslistToEsbuild from 'browserslist-to-esbuild';
import { defineConfig } from 'vite';
import { checker } from 'vite-plugin-checker';
import svgr from 'vite-plugin-svgr';
import topLevelAwait from 'vite-plugin-top-level-await';
import packageJson from './package.json';


const lintCommand = packageJson.scripts.lint;
const target = browserslistToEsbuild(packageJson.browserslist);
const corejs = packageJson.dependencies['core-js'].match(/\d+(\.\d+(\.\d+)?)?/)[0];

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    topLevelAwait(),
    TanStackRouterVite({
      routeFileIgnorePrefix: '-',
      autoCodeSplitting: true,
    }),
    react({
      babel: {
        plugins: ['module:@preact/signals-react-transform'],
        presets: [
          [
            // https://babeljs.io/docs/babel-preset-env
            '@babel/preset-env',
            {
              debug: false,
              bugfixes: true,
              modules: false,
              useBuiltIns: 'usage',
              corejs,
            },
          ],
        ],
      },
    }),
    checker({
      overlay: { initialIsOpen: false, position: 'br' },
      typescript: true,
      eslint: {
        lintCommand,
        useFlatConfig: false,
      },
    }),
    svgr(),
  ],
  build: { target },
  esbuild: { target },
  server: {
    host: true,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
});
