import { createFileRoute, Navigate } from '@tanstack/react-router';
import { useWeb3ModalState } from '@web3modal/wagmi/react';
import { Button } from '@nextui-org/react';
import { z } from 'zod';
import { DidModal } from '../components/modals/DidModal.tsx';
import { useAuroStore } from '../hooks/web3/auro/useAuro.store.ts';
import { IconEth, IconMina } from '../components/icons.tsx';
import { useCheckAuth } from '../hooks/web3/useCheckAuth.ts';
import { web3modal } from '@/config/wagmi-config.ts';
import { useWagmiConnector } from '@/hooks/web3/ethereum/useWagmiConnector.ts';

export const Route = createFileRoute('/')({
  component: SignInComponent,
  validateSearch: z.object({
    redirect: z.string().catch('/').optional(),
    proposalURL: z.string().optional(),
  }),
  beforeLoad: () => ({ title: 'Sign In' }),
});

function SignInComponent() {
  const auth = useCheckAuth();
  const search = Route.useSearch();
  const auro = useAuroStore();
  const { open: isEthConnecting } = useWeb3ModalState();
  const { connector: wagmiConnector, account: wagmiAccount } = useWagmiConnector();

  const openEthConnectModal = () => web3modal.open();

  if (!auth.isWalletConnected) {
    const isEthLoading = isEthConnecting || wagmiConnector.isFetching || !!wagmiAccount.address;
    const isMinaLoading = auro.isConnecting;

    const isMinaDisabled = isEthLoading || !window.mina;
    const isEthDisabled = isMinaLoading;

    return (
      <div className="max-w-[300px] mx-auto grow flex flex-col justify-center gap-3">
        <Button
          isDisabled={isEthDisabled}
          isLoading={isEthLoading}
          onClick={openEthConnectModal}
          size="lg"
          startContent={<IconEth className="w-7 h-7"/>}
        >Sign In With Ethereum</Button>
        <Button
          isDisabled={isMinaDisabled}
          isLoading={isMinaLoading}
          onClick={auro.connect}
          size="lg"
          startContent={<IconMina className="w-7 h-7"/>}
        >Sign In With Mina</Button>
      </div>
    );
  }

  if (!auth.isAuthorized) {
    return <DidModal/>;
  }

  if (search.proposalURL) {
    return <Navigate to={'/prove'} search={{ proposalURL: search.proposalURL }}/>;
  }
  return <Navigate to={search.redirect || '/credentials'}/>;
}
