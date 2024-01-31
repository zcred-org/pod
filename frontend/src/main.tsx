import React from 'react';
import ReactDOM from 'react-dom/client';
import { NextUIProvider } from '@nextui-org/react';
import { queryClient } from './common/api/query-client.ts';
import { wagmiConfig } from './common/api/wagmi-config.ts';
import { useAccountEffect, WagmiProvider } from 'wagmi';
import { QueryClientProvider } from '@tanstack/react-query';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen.ts';
import { Toaster } from 'sonner';
import { useAuth } from './hooks/useAuth.ts';
import { useMinaAccountEffect } from './common/mina/useMinaAccountEffect.ts';
import './index.css';
import './common/mina/auro-wallet.ts'

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  context: {
    // @ts-expect-error Because provided in RouterProvider
    auth: null,
  },
});

function App() {
  const auth = useAuth();
  useMinaAccountEffect({ onDisconnect: () => router.navigate({ to: '/' }) });
  useAccountEffect({ onDisconnect: () => router.navigate({ to: '/' }) });
  return <RouterProvider router={router} context={{ auth }}/>;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <NextUIProvider className="flex flex-col min-h-screen">
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <App/>
          <Toaster
            richColors
            // theme={isDarkTheme ? 'dark' : 'light'}
            theme="dark"
            position="top-center"
            closeButton
          />
        </QueryClientProvider>
      </WagmiProvider>
    </NextUIProvider>
  </React.StrictMode>,
);
