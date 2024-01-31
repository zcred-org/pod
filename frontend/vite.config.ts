import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// import svgr from 'vite-plugin-svgr';
import checker from 'vite-plugin-checker';
import { TanStackRouterVite } from '@tanstack/router-vite-plugin';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    TanStackRouterVite({ routeFileIgnorePrefix: '-' }),
    // svgr(),
    checker({ typescript: true, overlay: { initialIsOpen: false, position: 'br' } }),
  ],
});
