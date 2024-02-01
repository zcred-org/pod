import { createFileRoute, Navigate } from '@tanstack/react-router';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { Button } from '@nextui-org/react';
import { z } from 'zod';
import { DidModal } from './-DidModal.tsx';
import { useAuth } from '../../hooks/web3/useAuth.ts';
import { useAuroAccount } from '../../hooks/web3/auro/useAuroAccount.ts';
import { IconEth, IconMina } from '../../components/icons.tsx';

export const Route = createFileRoute('/sign-in')({
  component: SignInComponent,
  validateSearch: z.object({
    redirect: z.string().catch('/').optional(),
  }),
});

function SignInComponent() {
  const search = Route.useSearch();
  const auth = useAuth();
  const auro = useAuroAccount();
  const ethWeb3Modal = useWeb3Modal();
  const openEthConnectModal = () => ethWeb3Modal.open();

  if (!auth.address) return (
    <div className="max-w-[300px] mx-auto grow flex flex-col justify-center gap-3">
      <Button
        onClick={openEthConnectModal}
        size="lg"
        isDisabled={auro.isConnecting}
        startContent={<IconEth className='w-7 h-7 fill-blue-500 -mr-1'/>}
      >Sign In With Ethereum</Button>
      <Button
        isLoading={auro.isConnecting}
        isDisabled={!window.mina}
        onClick={auro.connect}
        startContent={<IconMina className='w-7 h-7 fill-indigo-500 stroke-indigo-500 stroke-1'/>}
        size="lg"
      >Sign In With Mina</Button>
    </div>
  );

  if (!auth.did.did) {
    return <DidModal/>;
  }

  return <Navigate to={search.redirect ?? '/credentials'}/>;
}
