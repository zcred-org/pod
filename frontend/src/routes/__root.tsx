import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { useEffect } from 'react';
import { Toaster } from 'sonner';
import { Devtools } from '@/components/dev/Devtools.tsx';
import { Header } from '@/components/Header/Header.tsx';
import { CredentialValidIntervalModal } from '@/components/modals/CredentialValidIntervalModal.tsx';
import { DidModal } from '@/components/modals/DidModal.tsx';
import { PromptModals } from '@/components/modals/PromptModals.tsx';
import { ErrorView } from '@/components/sub-pages/ErrorView.tsx';
import { NotFoundView } from '@/components/sub-pages/NotFoundView.tsx';
import { PendingView } from '@/components/sub-pages/PendingView.tsx';
import { useWagmiConnector } from '@/hooks/web3/ethereum/useWagmiConnector.ts';
import { ThemeStore } from '@/stores/theme.store.ts';
import { WalletStore } from '@/stores/wallet.store.ts';
import { WalletTypeEnum } from '@/types/wallet-type.enum.ts';


interface RouterContext {
  title: string;
  isCanBack?: boolean;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  notFoundComponent: NotFoundView,
  pendingComponent: PendingView,
  errorComponent: ErrorView,
});

function RootLayout() {
  return (
    <>
      <Header />
      <Outlet />

      <DidModal />
      <CredentialValidIntervalModal />
      <PromptModals />

      <WagmiConnectorSubscription />
      <Toast />
      <Devtools />
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
