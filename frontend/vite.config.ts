import { TanStackRouterVite } from '@tanstack/router-vite-plugin';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vite';
import { checker } from 'vite-plugin-checker';
import svgr from 'vite-plugin-svgr';
import topLevelAwait from 'vite-plugin-top-level-await';
// import eslint from 'vite-plugin-eslint';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({ babel: { plugins: ['module:@preact/signals-react-transform'] } }),
    TanStackRouterVite({ routeFileIgnorePrefix: '-' }),
    checker({ typescript: true, overlay: { initialIsOpen: false, position: 'br' } }),
    // eslint({ failOnError: false }),
    topLevelAwait(),
    svgr(),
  ],
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  worker: {
    format: 'es',
  },
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
});
