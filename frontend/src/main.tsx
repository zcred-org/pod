import React from 'react';
import ReactDOM from 'react-dom/client';
import { NextUIProvider } from '@nextui-org/react';
import { queryClient } from './common/api/query-client.ts';
import { wagmiConfig } from './common/api/wagmi-config.ts';
import { WagmiProvider } from 'wagmi';
import { QueryClientProvider } from '@tanstack/react-query';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen.ts';
import { useAuth } from './hooks/web3/useAuth.ts';
import './common/api/wallet-adapter-auro.ts';
import './index.css';

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
    auth: { },
  },
});

function App() {
  const auth = useAuth();
  return <RouterProvider router={router} context={{ auth }}/>;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <NextUIProvider className="flex flex-col min-h-screen">
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <App/>
        </QueryClientProvider>
      </WagmiProvider>
    </NextUIProvider>
  </React.StrictMode>,
);
