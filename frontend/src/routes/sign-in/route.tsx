import { createFileRoute, Navigate } from '@tanstack/react-router';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { Button } from '@nextui-org/react';
import { z } from 'zod';
import { DidModal } from './-DidModal.tsx';
import { useAuth } from '../../hooks/useAuth.ts';
import { useMinaAccount } from '../../common/mina/useMinaAccount.ts';

export const Route = createFileRoute('/sign-in')({
  component: SignInComponent,
  validateSearch: z.object({
    redirect: z.string().catch('/').optional(),
  }),
});

function SignInComponent() {
  const { redirect } = Route.useSearch();
  const auth = useAuth();
  const mina = useMinaAccount();
  const ethWeb3Modal = useWeb3Modal();
  const openEthConnectModal = () => ethWeb3Modal.open();

  if (!auth.address) return (
    <div className="max-w-[300px] mx-auto grow flex flex-col justify-center gap-3">
      <Button onClick={openEthConnectModal} size="lg">Sign In With Ethereum</Button>
      <Button isDisabled={!window.mina} onClick={mina.connect} size="lg">Sign In With Mina</Button>
    </div>
  );

  if (!auth.did.did) {
    return (
      <>
        <div className="max-w-[300px] mx-auto grow flex flex-col justify-center gap-3">
          <Button onClick={DidModal.open}>Prove you own this wallet</Button>
        </div>
        <DidModal/>
      </>
    );
  }

  return <Navigate to={redirect ?? '/credentials'}/>;
}
