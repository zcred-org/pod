import { createFileRoute, Navigate, redirect } from '@tanstack/react-router';
import { useWeb3Modal, useWeb3ModalEvents, useWeb3ModalState } from '@web3modal/wagmi/react';
import { Button } from '@nextui-org/react';
import { z } from 'zod';
import { DidModal } from '../components/modals/DidModal.tsx';
import { useAuroStore } from '../hooks/web3/auro/useAuro.store.ts';
import { IconEth, IconMina } from '../components/icons.tsx';
import { useDidStore } from '../hooks/useDid.store.ts';
import { useCheckAuth } from '../hooks/web3/useCheckAuth.ts';
import { useEffect } from 'react';
import { useWalletTypeStore, WalletTypeEnum } from '../hooks/web3/useWalletType.store.ts';

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
  const auth = useCheckAuth();
  const search = Route.useSearch();
  const did = useDidStore(state => state.did);
  const auro = useAuroStore();
  const ethWeb3Modal = useWeb3Modal();
  const { open: isEthConnecting } = useWeb3ModalState();
  const { data: { event: web3ModalEvent } } = useWeb3ModalEvents();

  useEffect(() => {
    if (web3ModalEvent === 'CONNECT_SUCCESS') {
      useWalletTypeStore.getState().reset(WalletTypeEnum.Ethereum);
    }
  }, [web3ModalEvent]);

  const openEthConnectModal = () => ethWeb3Modal.open();

  if (!auth.isWalletConnected) return (
    <div className="max-w-[300px] mx-auto grow flex flex-col justify-center gap-3">
      <Button
        isDisabled={auro.isConnecting}
        isLoading={isEthConnecting}
        onClick={openEthConnectModal}
        size="lg"
        startContent={<IconEth className="w-7 h-7 fill-blue-500 -mr-1"/>}
      >Sign In With Ethereum</Button>
      <Button
        isDisabled={!window.mina || isEthConnecting}
        isLoading={auro.isConnecting}
        onClick={auro.connect}
        size="lg"
        startContent={<IconMina className="w-7 h-7 fill-indigo-500 stroke-indigo-500 stroke-1"/>}
      >Sign In With Mina</Button>
    </div>
  );

  if (!did) {
    return <DidModal/>;
  }

  return <Navigate to={search.redirect as never ?? '/credentials'}/>;
}
