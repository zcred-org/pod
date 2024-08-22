import { Button, Progress } from '@nextui-org/react';
import { createFileRoute, Navigate } from '@tanstack/react-router';
import { useWeb3ModalState } from '@web3modal/wagmi/react';
import { z } from 'zod';
import { IconByWalletType, IconEth } from '@/components/icons/icons.tsx';
import { DidModal } from '@/components/modals/DidModal.tsx';
import { SwitchToRequiredIdModal } from '@/components/modals/SwitchToRequiredIdModal.tsx';
import { PageContainer } from '@/components/PageContainer.tsx';
import { web3modal } from '@/config/wagmi-config.ts';
import { useWagmiConnector } from '@/hooks/web3/ethereum/useWagmiConnector.ts';
import { $isWalletAndDidConnected, $isWalletConnected } from '@/stores/other.ts';
import { VerificationInitActions } from '@/stores/verification-store/verification-init-actions.ts';
import { VerificationStore, verificationStoreInitArgsFrom } from '@/stores/verification-store/verification-store.ts';
import { VerificationTerminateActions } from '@/stores/verification-store/verification-terminate-actions.ts';
import { WalletStore } from '@/stores/wallet.store.ts';
import { WalletTypeEnum } from '@/types/wallet-type.enum.ts';
import { addressShort, isSubjectIdsEqual, subjectTypeToWalletEnum } from '@/util/helpers.ts';


export const Route = createFileRoute('/')({
  component: SignInComponent,
  pendingComponent: PendingComponent,
  validateSearch: z.object({
    redirect: z.string().catch('/').optional(),
    proposalURL: z.string().optional(),
  }),
  beforeLoad: () => ({ title: 'Sign In' }),
  loaderDeps: ({ search }) => search,
  loader: async ({ deps: { proposalURL } }) => {
    const verificationInitArgs = verificationStoreInitArgsFrom({ proposalURL });
    if (verificationInitArgs) {
      await VerificationInitActions.init(verificationInitArgs);
    }
    const { requiredId, verifierHost } = VerificationStore.$initDataAsync.peek().data || {};
    return {
      verifierHost,
      requiredId,
      requiredWallet: requiredId ? subjectTypeToWalletEnum(requiredId.type) : undefined,
      proveArgs: verificationInitArgs,
    };
  },
});

function SignInComponent() {
  const search = Route.useSearch();
  const { requiredWallet, proveArgs, requiredId, verifierHost } = Route.useLoaderData();
  const { open: isEthConnecting } = useWeb3ModalState();
  const { connector: wagmiConnector, account: wagmiAccount } = useWagmiConnector();
  const wallet = WalletStore.$wallet.value;

  if (!$isWalletConnected.value) {
    const isEthLoading = isEthConnecting || wagmiConnector.isFetching || !!wagmiAccount.address;
    // const isMinaLoading = AuroStore.$isConnecting.value;

    const isEthDisabled = VerificationStore.$terminateAsync.value.isLoading /*|| isMinaLoading */;
    // const isMinaDisabled = isEthLoading || !window.mina || VerificationStore.$terminateAsync.value.isLoading;

    const isEthVisible = !requiredWallet || requiredWallet === WalletTypeEnum.Ethereum;
    // const isMinaVisible = !requiredWallet || requiredWallet === WalletTypeEnum.Auro;

    return (
      <PageContainer className="grow items-center justify-center">
        {requiredId ? (<>
          <p>
            {'To create a proof for '}
            <span className="underline">{verifierHost}</span>
          </p>
          <p>you need to be logged in with:</p>
          <p className="flex items-center gap-2">
            <IconByWalletType walletType={requiredWallet} className="w-7 h-7 inline" />
            {' '}{addressShort(requiredId.key)}
          </p>
        </>) : null}
        <div className="max-w-[300px] mx-auto flex flex-col justify-center gap-5">
          {isEthVisible && <Button
            className="text-white shadow-xl shadow-blue-500/30 bg-gradient-to-br from-blue-400 to-blue-600 dark:from-blue-400 dark:to-blue-700"
            isDisabled={isEthDisabled}
            isLoading={isEthLoading}
            onClick={() => web3modal.open()}
            size="lg"
          ><IconEth className="w-7 h-7 fill-white" />Sign In With Ethereum</Button>}
          {/*{isMinaVisible && <Button*/}
          {/*  className="text-white shadow-xl shadow-indigo-500/30 bg-gradient-to-br from-indigo-400 to-indigo-600 dark:from-indigo-400 dark:to-indigo-700"*/}
          {/*  isDisabled={isMinaDisabled}*/}
          {/*  isLoading={isMinaLoading}*/}
          {/*  onClick={AuroStore.connect}*/}
          {/*  size="lg"*/}
          {/*><IconMina className="w-7 h-7 fill-white stroke-white" />Sign In With Mina</Button>}*/}
          {requiredId && <div className="h-3" />}
          {requiredId && <Button
            onClick={VerificationTerminateActions.rejectByUser}
            size="sm"
            isLoading={VerificationStore.$terminateAsync.value.isLoading}
            variant="light"
            color="danger"
          >Reject</Button>}
        </div>
      </PageContainer>
    );
  }

  if (requiredId && wallet && !isSubjectIdsEqual(wallet.subjectId, requiredId)) return (
    <SwitchToRequiredIdModal
      requiredId={requiredId}
      subjectId={wallet.subjectId}
    />
  );

  if (!$isWalletAndDidConnected.value) {
    return <DidModal />;
  }

  if (proveArgs) {
    return <Navigate to={'/prove'} search={proveArgs} />;
  }
  return <Navigate to={search.redirect || '/credentials'} />;
}


function PendingComponent() {
  return (
    <PageContainer className="grow justify-center">
      <Progress isIndeterminate label="Loading proposal..." />
    </PageContainer>
  );
}
