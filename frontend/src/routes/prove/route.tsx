import { Button, Card, CardBody, CardHeader, Divider, Progress, Skeleton, Textarea } from '@nextui-org/react';
import { computed } from '@preact/signals-react';
import { createFileRoute, redirect, useBlocker, type ErrorComponentProps, useRouter } from '@tanstack/react-router';
import { z } from 'zod';
import { RequireWalletAndDidHoc } from '@/components/HOC/RequireWalletAndDidHoc.tsx';
import { promptModal } from '@/components/modals/PromptModals.tsx';
import { SwitchToRequiredIdModal } from '@/components/modals/SwitchToRequiredIdModal.tsx';
import { PageContainer } from '@/components/PageContainer.tsx';
import { ProveCredentialSelect } from '@/routes/prove/-components/ProveCredentialSelect.tsx';
import { ProveDescription } from '@/routes/prove/-components/ProveDescription.tsx';
import { ProvePageButtons } from '@/routes/prove/-components/ProvePageButtons.tsx';
import { ProveRoutePath } from '@/routes/prove/-constants.ts';
import { $isWalletAndDidConnected } from '@/stores/other.ts';
import { VerificationInitActions } from '@/stores/verification-store/verification-init-actions.ts';
import { VerificationStore } from '@/stores/verification-store/verification-store.ts';
import { VerificationTerminateActions } from '@/stores/verification-store/verification-terminate-actions.ts';
import { WalletStore } from '@/stores/wallet.store.ts';
import { ZCredSessionStore } from '@/stores/zcred-session.store.ts';


export const Route = createFileRoute(ProveRoutePath)({
  component: () => <RequireWalletAndDidHoc><ProveComponent /></RequireWalletAndDidHoc>,
  validateSearch: z.object({
    proposalURL: z.string(),
    [ZCredSessionStore.searchQueryKey]: z.string().optional(),
  }),
  pendingComponent: PendingComponent,
  errorComponent: ErrorComponent,
  beforeLoad: ({ search, cause }) => {
    if (!$isWalletAndDidConnected.value && cause !== 'preload') {
      throw redirect({ to: '/', search });
    }
    return { title: `Verification` };
  },
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => VerificationInitActions.init(deps),
  onEnter: VerificationInitActions.subscriptionsEnable,
  onLeave: VerificationInitActions.subscriptionsDisable,
});

function ProveComponent() {
  const router = useRouter();
  const $isNavigateBlocked = VerificationStore.$isNavigateBlocked;
  const holyCrapWhatsLoadingNow = VerificationStore.$holyCrapWhatsLoadingNow.value;
  const isSubjectMatch = VerificationStore.$isSubjectMatch.value;
  const initDataState = VerificationStore.$initDataAsync.value;
  const wallet = WalletStore.$wallet.value;

  useBlocker({
    condition: $isNavigateBlocked.value,
    blockerFn: async () => {
      if (!$isNavigateBlocked.peek()) return true;
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

  if (initDataState.isLoading) return <PendingComponent />;
  if (initDataState.isError || !initDataState.isSuccess) return (
    <ErrorComponent
      error={initDataState.error || new Error('unknown error')}
      reset={router.invalidate}
    />
  );
  if (!isSubjectMatch) return (
    <SwitchToRequiredIdModal
      requiredId={initDataState.data.requiredId}
      subjectId={wallet!.subjectId}
    />
  );

  return (
    <PageContainer className="sm:max-w-xl">
      <ProveDescription />
      <Divider />
      {initDataState.data.proposal.comment ? <Textarea
        label="Comment:"
        labelPlacement="outside"
        value={initDataState.data.proposal.comment}
        isReadOnly isRequired
        minRows={1}
      /> : null}
      <ProveCredentialSelect />
      <div className="grow">
        {computed(() => holyCrapWhatsLoadingNow ? <Progress
          isIndeterminate
          label={holyCrapWhatsLoadingNow.text}
          classNames={{ label: 'mx-auto' }}
        /> : null)}
      </div>
      <ProvePageButtons />
    </PageContainer>
  );
}

function PendingComponent() {
  // TODO: Re-implement skeleton according to current layout
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
      <Button className="grow" variant="light" color="danger" isDisabled>Reject</Button>
      <Button className="grow" color="success" isDisabled>Create proof</Button>
    </div>
  </PageContainer>;
}

function ErrorComponent({ error, reset }: Pick<ErrorComponentProps, 'error' | 'reset'>) {
  const _reset = async () => {
    VerificationInitActions.restart().then();
    reset();
  };

  return <PageContainer isCenter>
    {error instanceof Error ? <p>Error: {error.message}</p> : <p>Unknown Error</p>}
    <Button onPress={_reset}>Try to reload</Button>
  </PageContainer>;
}
