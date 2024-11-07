import { NextUIProvider } from '@nextui-org/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { WagmiProvider } from 'wagmi';
import { config } from '@/config';
import { AppGlobal } from '@/config/app-global.ts';
import { queryClient } from '@/config/query-client.ts';
import { wagmiConfig } from '@/config/wagmi-config.ts';
import { routeTree } from '@/routeTree.gen.ts';
import { VerificationErrorActions } from '@/stores/verification-store/verification-error-actions.tsx';
import './index.css';


declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export type router = typeof router;
const router = createRouter({
  routeTree,
  defaultPreload: 'viewport',
  context: {
    title: config.appName,
  },
});
const navigate = (path: string) => void router.navigate({ to: path });


AppGlobal.router = router;
AppGlobal.VerificationErrorActions = VerificationErrorActions;


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

