import React from 'react';
import ReactDOM from 'react-dom/client';
import { NextUIProvider } from '@nextui-org/react';
import { queryClient } from './config/query-client.ts';
import { wagmiConfig } from './config/wagmi-config.ts';
import { WagmiProvider } from 'wagmi';
import { QueryClientProvider } from '@tanstack/react-query';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen.ts';
import { HelmetProvider } from 'react-helmet-async';
import './index.css';

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  context: {
    title: 'ZCred App',
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <NextUIProvider className="flex flex-col min-h-screen">
          <HelmetProvider>
            <RouterProvider router={router}/>
          </HelmetProvider>
        </NextUIProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>,
);
