import { createRootRouteWithContext, Link, Outlet } from '@tanstack/react-router';
import { Button } from '@nextui-org/react';
import { useThemeStore } from '@/hooks/useTheme.store.ts';
import { TanStackRouterDevtools } from '@/components/dev/TanStackRouterDevtools.tsx';
import { Toaster } from 'sonner';
import { Header } from '@/components/Header/Header.tsx';
import { useEffect } from 'react';
import { WalletAddressEventEmitter, WalletAddressEventsEnum } from '@/service/events/wallet-address-event.emitter.ts';
import { WalletTypeEnum } from '@/types/wallet-type.enum.ts';
import { useWagmiConnector } from '@/hooks/web3/ethereum/useWagmiConnector.ts';
import { Alerts } from '@/components/modals/Alerts.tsx';


interface RouterContext {
  title: string;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootComponent() {
  const isDarkTheme = useThemeStore(state => state.isDark);

  // Global subscription to ETH address changes
  const { connector } = useWagmiConnector();
  useEffect(() => {
    if (connector.isFetching || connector.failureReason) return;
    WalletAddressEventEmitter.emit(
      WalletAddressEventsEnum.WalletChanged,
      WalletTypeEnum.Ethereum,
      connector.data?.account.address || null,
    );
  }, [connector]);

  return (
    <>
      <Header/>
      <Outlet/>
      <TanStackRouterDevtools/>
      <Alerts/>
      <Toaster
        richColors
        theme={isDarkTheme ? 'dark' : 'light'}
        position="top-center"
        closeButton
      />
    </>
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
