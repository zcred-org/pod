import React from 'react';
import ReactDOM from 'react-dom/client';
import { NextUIProvider } from '@nextui-org/react';
import { queryClient } from './service/query-client.ts';
import { wagmiConfig } from './config/wagmi-config.ts';
import { WagmiProvider } from 'wagmi';
import { QueryClientProvider } from '@tanstack/react-query';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen.ts';
import './service/auro.ts';
import './index.css';

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <NextUIProvider className="flex flex-col min-h-screen">
          <RouterProvider router={router}/>
        </NextUIProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>,
);
