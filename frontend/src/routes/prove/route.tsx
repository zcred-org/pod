import { Button, Card, CardBody, CardHeader, Divider, Progress, Skeleton, Textarea } from '@nextui-org/react';
import { computed } from '@preact/signals-react';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { useEffect } from 'react';
import { z } from 'zod';
import { RequireWalletAndDidHoc } from '@/components/HOC/RequireWalletAndDidHoc.tsx';
import { SwitchToRequiredIdModal } from '@/components/modals/SwitchToRequiredIdModal.tsx';
import { PageContainer } from '@/components/PageContainer.tsx';
import { ProveCredentialSelect } from '@/routes/prove/-components/ProveCredentialSelect.tsx';
import { ProveFriendlyJAL } from '@/routes/prove/-components/ProveFriendlyJAL.tsx';
import { ProvePageButtons } from '@/routes/prove/-components/ProvePageButtons.tsx';
import { ProveTitleText } from '@/routes/prove/-components/ProveTitleText.tsx';
import { $isWalletAndDidConnected } from '@/stores/other.ts';
import { VerificationActions } from '@/stores/verification-store/verification-actions.ts';
import { VerificationInitActions } from '@/stores/verification-store/verification-init-actions.ts';
import { VerificationStore } from '@/stores/verification-store/verification-store.ts';
import { WalletStore } from '@/stores/wallet.store.ts';


export const Route = createFileRoute('/prove')({
  component: () => <RequireWalletAndDidHoc><ProveComponent /></RequireWalletAndDidHoc>,
  validateSearch: z.object({
    proposalURL: z.string(),
    sdid: z.string(),
  }),
  pendingComponent: PendingComponent,
  beforeLoad: ({ search, cause }) => {
    if (!$isWalletAndDidConnected.value && cause !== 'preload') {
      throw redirect({ to: '/', search });
    }
    const verifierHost = new URL(search.proposalURL).host;
    return { title: `Prove for ${verifierHost}` };
  },
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => await VerificationInitActions.init(deps),
});

function ProveComponent() {
  const {
    $initDataAsync,
    $isSubjectMatch,
    $holyCrapWhatsLoadingNow,
  } = VerificationStore;
  const wallet = WalletStore.$wallet.value;

  useEffect(() => {
    VerificationActions.subscriptionsEnable();
    return VerificationActions.subscriptionsDisable;
  }, []);

  if (!$isSubjectMatch.value) return (
    <SwitchToRequiredIdModal
      requiredId={$initDataAsync.value.data!.requiredId}
      subjectId={wallet!.subjectId}
    />
  );

  return (
    <PageContainer>
      <ProveTitleText />
      <ProveFriendlyJAL />
      <ProveCredentialSelect />
      {$initDataAsync.value.data?.proposal.comment ? <Textarea
        label="Comment"
        defaultValue={$initDataAsync.value.data.proposal.comment}
        isReadOnly isRequired
        minRows={1}
      /> : null}
      <div className="grow">
        {computed(() => $holyCrapWhatsLoadingNow.value ? <Progress
          isIndeterminate
          label={$holyCrapWhatsLoadingNow.value}
        /> : null)}
      </div>
      <div className="flex gap-3">
        <ProvePageButtons />
      </div>
    </PageContainer>
  );
}

function PendingComponent() {
  return <PageContainer>
    <div className="flex items-center gap-1">
      <Skeleton className="w-20 h-5 rounded-md" />
      {' asks you to create a proof:'}
    </div>
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-[30%] rounded-md" />
      </CardHeader>
      <Divider />
      <CardBody className="flex flex-col gap-2">
        <Skeleton className="h-4 w-[20%] rounded-md" />
        <Skeleton className="h-4 w-[40%] rounded-md" />
        <Skeleton className="h-4 w-[56%] rounded-md" />
        <Skeleton className="h-4 w-[48%] rounded-md" />
        <Skeleton className="h-4 w-[32%] rounded-md" />
      </CardBody>
    </Card>
    <div className="flex gap-3">
      <Button className="grow" variant="light" color="danger" disabled isLoading>Reject</Button>
      <Button className="grow" color="success" disabled isLoading>Create proof</Button>
    </div>
  </PageContainer>;
}
