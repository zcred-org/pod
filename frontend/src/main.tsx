import { NextUIProvider } from '@nextui-org/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { WagmiProvider } from 'wagmi';
import { queryClient } from './config/query-client.ts';
import { wagmiConfig } from './config/wagmi-config.ts';
import { routeTree } from './routeTree.gen.ts';
import './index.css';

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const navigate = (path: string) => void router.navigate({ to: path });

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  context: {
    title: 'ZCred App',
  },
});
// @ts-expect-error - globalThis is not defined in the types
globalThis.appRouter = router;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <NextUIProvider className="flex flex-col min-h-screen" navigate={navigate}>
          <HelmetProvider>
            <RouterProvider router={router} />
          </HelmetProvider>
        </NextUIProvider>
      </WagmiProvider>
    </QueryClientProvider>
  </StrictMode>,
);
