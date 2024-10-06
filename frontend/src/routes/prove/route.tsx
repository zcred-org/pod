import { Button, Card, CardBody, CardHeader, Divider, Progress, Skeleton, Textarea } from '@nextui-org/react';
import { computed } from '@preact/signals-react';
import { createFileRoute, redirect, useBlocker } from '@tanstack/react-router';
import { z } from 'zod';
import { RequireWalletAndDidHoc } from '@/components/HOC/RequireWalletAndDidHoc.tsx';
import { promptModal } from '@/components/modals/PromptModals.tsx';
import { SwitchToRequiredIdModal } from '@/components/modals/SwitchToRequiredIdModal.tsx';
import { PageContainer } from '@/components/PageContainer.tsx';
import { ProveCredentialSelect } from '@/routes/prove/-components/ProveCredentialSelect.tsx';
import { ProveDescription } from '@/routes/prove/-components/ProveDescription.tsx';
import { ProvePageButtons } from '@/routes/prove/-components/ProvePageButtons.tsx';
import { $isWalletAndDidConnected } from '@/stores/other.ts';
import { VerificationInitActions } from '@/stores/verification-store/verification-init-actions.ts';
import { VerificationStore } from '@/stores/verification-store/verification-store.ts';
import { VerificationTerminateActions } from '@/stores/verification-store/verification-terminate-actions.ts';
import { WalletStore } from '@/stores/wallet.store.ts';


export const Route = createFileRoute('/prove')({
  component: () => <RequireWalletAndDidHoc><ProveComponent /></RequireWalletAndDidHoc>,
  validateSearch: z.object({
    proposalURL: z.string(),
  }),
  pendingComponent: PendingComponent,
  beforeLoad: ({ search, cause }) => {
    if (!$isWalletAndDidConnected.value && cause !== 'preload') {
      throw redirect({ to: '/', search });
    }
    return { title: `Verification` };
  },
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    await VerificationInitActions.init(deps);
    VerificationInitActions.postInitAfterLogin().then();
  },
  onEnter: VerificationInitActions.subscriptionsEnable,
  onLeave: VerificationInitActions.subscriptionsDisable,
});

function ProveComponent() {
  const {
    $initDataAsync,
    $isSubjectMatch,
    $holyCrapWhatsLoadingNow,
    $terminateAsync,
  } = VerificationStore;
  const wallet = WalletStore.$wallet.value;

  useBlocker({
    blockerFn: async () => {
      const terminateState = $terminateAsync.peek();
      if (terminateState.isSuccess || terminateState.isError) return true;
      const res = await promptModal({
        title: 'Are you sure?',
        text: 'Leaving this page will reject verification',
        actions: [
          { label: 'Reject verification', value: 'Reject', variant: 'light', color: 'danger' },
          { label: 'Continue verification', value: 'Cancel', variant: 'shadow', color: 'success' },
        ],
      });
      if (res === 'Reject') VerificationTerminateActions.rejectByUser().then();
      return false;
    },
  });

  if ($initDataAsync.value.isLoading) return <PendingComponent />;
  if (!$isSubjectMatch.value) return (
    <SwitchToRequiredIdModal
      requiredId={$initDataAsync.value.data!.requiredId}
      subjectId={wallet!.subjectId}
    />
  );

  return (
    <PageContainer className="sm:max-w-xl">
      <ProveDescription />
      <Divider />
      {$initDataAsync.value.data?.proposal.comment ? <Textarea
        label="Comment:"
        labelPlacement="outside"
        value={$initDataAsync.value.data.proposal.comment}
        isReadOnly isRequired
        minRows={1}
      /> : null}
      <ProveCredentialSelect />
      <div className="grow">
        {computed(() => $holyCrapWhatsLoadingNow.value ? <Progress
          isIndeterminate
          label={$holyCrapWhatsLoadingNow.value.text}
          classNames={{ label: 'mx-auto' }}
        /> : null)}
      </div>
      <ProvePageButtons />
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
      <Button className="grow" variant="light" color="danger" disabled>Reject</Button>
      <Button className="grow" color="success" disabled>Create proof</Button>
    </div>
  </PageContainer>;
}
