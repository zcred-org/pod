import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import checker from 'vite-plugin-checker';
import topLevelAwait from "vite-plugin-top-level-await";
import svgr from 'vite-plugin-svgr';
import { TanStackRouterVite } from '@tanstack/router-vite-plugin';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    TanStackRouterVite({ routeFileIgnorePrefix: '-' }),
    checker({ typescript: true, overlay: { initialIsOpen: false, position: 'br' } }),
    topLevelAwait(),
    svgr(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
