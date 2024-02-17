import { createFileRoute, Navigate, redirect } from '@tanstack/react-router';
import { useWeb3Modal, useWeb3ModalState } from '@web3modal/wagmi/react';
import { Button } from '@nextui-org/react';
import { z } from 'zod';
import { DidModal } from '../components/modals/DidModal.tsx';
import { useAuroStore } from '../hooks/web3/auro/useAuro.store.ts';
import { IconEth, IconMina } from '../components/icons.tsx';
import { useDidStore } from '../hooks/useDid.store.ts';
import { useAuth } from '../hooks/web3/useAuth.ts';

export const Route = createFileRoute('/')({
  component: SignInComponent,
  validateSearch: z.object({
    redirect: z.string().catch('/').optional(),
    proposalURL: z.string().optional(),
  }),
  beforeLoad: ({ search }) => {
    const { proposalURL } = search;
    if (proposalURL) throw redirect({ to: '/prove', search: { proposalURL } });
  },
});

function SignInComponent() {
  const auth = useAuth();
  const search = Route.useSearch();
  const did = useDidStore(state => state.did);
  const auro = useAuroStore();
  const ethWeb3Modal = useWeb3Modal();
  const { open: isEthConnecting } = useWeb3ModalState();

  const openEthConnectModal = () => ethWeb3Modal.open();

  if (!auth.isWalletConnected) return (
    <div className="max-w-[300px] mx-auto grow flex flex-col justify-center gap-3">
      <Button
        onClick={openEthConnectModal}
        size="lg"
        isDisabled={auro.isConnecting}
        isLoading={isEthConnecting}
        startContent={<IconEth className="w-7 h-7 fill-blue-500 -mr-1"/>}
      >Sign In With Ethereum</Button>
      <Button
        isLoading={auro.isConnecting}
        isDisabled={!window.mina || isEthConnecting}
        onClick={auro.connect}
        startContent={<IconMina className="w-7 h-7 fill-indigo-500 stroke-indigo-500 stroke-1"/>}
        size="lg"
      >Sign In With Mina</Button>
    </div>
  );

  if (!did) {
    return <DidModal/>;
  }

  return <Navigate to={search.redirect as never ?? '/credentials'}/>;
}
