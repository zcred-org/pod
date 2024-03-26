import { Button } from '@nextui-org/react';
import { createRootRouteWithContext, Link, Outlet } from '@tanstack/react-router';
import { useEffect } from 'react';
import { Toaster } from 'sonner';
import { TanStackRouterDevtools } from '@/components/dev/TanStackRouterDevtools.tsx';
import { Header } from '@/components/Header/Header.tsx';
import { CredentialValidIntervalModal } from '@/components/modals/CredentialValidIntervalModal.tsx';
import { PromptModals } from '@/components/modals/PromptModals.tsx';
import { useWagmiConnector } from '@/hooks/web3/ethereum/useWagmiConnector.ts';
import { ThemeStore } from '@/stores/theme.store.ts';
import { WalletStore } from '@/stores/wallet.store.ts';
import { WalletTypeEnum } from '@/types/wallet-type.enum.ts';


interface RouterContext {
  title: string;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootComponent() {
  return (
    <>
      <Header />
      <Outlet />
      <TanStackRouterDevtools />
      <PromptModals />
      <WagmiConnectorSubscription />
      <Toast/>
      <CredentialValidIntervalModal />
    </>
  );
}

function WagmiConnectorSubscription() {
  // Global subscription to ETH address changes
  const { connector } = useWagmiConnector();
  useEffect(() => {
    if (connector.isFetching || connector.failureReason) return;
    WalletStore.calcNextWallet({
      maybeWalletType: WalletTypeEnum.Ethereum,
      isConnected: !!connector.data?.account.address,
    }).then(WalletStore.commit);
  }, [connector]);

  return null;
}

function Toast() {
  return (
    <Toaster
      richColors
      theme={ThemeStore.$isDark.value ? 'dark' : 'light'}
      position="top-center"
      closeButton
    />
  );
}

function NotFoundComponent() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen">
      <h1 className="text-4xl">404</h1>
      <p>Page not found</p>
      <Link to={'/'}><Button className="mt-6">Go home</Button></Link>
    </div>
  );
}
