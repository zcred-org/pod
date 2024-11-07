import { Button, Card, CardBody, CardHeader, Divider, Skeleton, Textarea } from '@nextui-org/react';
import { computed } from '@preact/signals-react';
import { type ErrorComponentProps, createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { RequireWalletAndDidHoc } from '@/components/HOC/RequireWalletAndDidHoc.tsx';
import { SwitchToRequiredIdModal } from '@/components/modals/SwitchToRequiredIdModal.tsx';
import { PageContainer } from '@/components/PageContainer.tsx';
import { ErrorView } from '@/components/sub-pages/ErrorView.tsx';
import { ApproximateSpin } from '@/components/ui/LoadingSpin/ApproximateSpin.tsx';
import { ProveCredentialSelect } from '@/routes/prove/-components/ProveCredentialSelect.tsx';
import { ProveDescription } from '@/routes/prove/-components/ProveDescription.tsx';
import { ProvePageButtons } from '@/routes/prove/-components/ProvePageButtons.tsx';
import { ProveRoutePath } from '@/routes/prove/-constants.ts';
import { VerificationInitActions } from '@/stores/verification-store/verification-init-actions.ts';
import { VerificationStore, HolyCrapWhatsLoadingNowStageEnum } from '@/stores/verification-store/verification-store.ts';
import { WalletStore } from '@/stores/wallet.store.ts';
import { ZCredIssueStore } from '@/stores/z-cred-issue.store.ts';
import { routeRequireWalletAndDid } from '@/util/route-require-wallet-and-did.ts';


export const Route = createFileRoute(ProveRoutePath)({
  component: () => <RequireWalletAndDidHoc><ProveComponent /></RequireWalletAndDidHoc>,
  validateSearch: z.object({
    proposalURL: z.string(),
    [ZCredIssueStore.searchQueryKey]: z.string().optional(),
  }),
  pendingComponent: VerificationPendingView,
  errorComponent: VerificationErrorView,
  beforeLoad: ({ cause, location }) => {
    if (cause !== 'preload') routeRequireWalletAndDid(location);
    return { title: `Verification` };
  },
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => VerificationInitActions.init(deps),
  onEnter: VerificationInitActions.subscriptionsEnable,
  onLeave: VerificationInitActions.subscriptionsDisable,
});

function ProveComponent() {
  const holyCrapWhatsLoadingNow = VerificationStore.$holyCrapWhatsLoadingNow.value;
  const isSubjectMatch = VerificationStore.$isSubjectMatch.value;
  const initDataState = VerificationStore.$initDataAsync.value;
  const wallet = WalletStore.$wallet.value;

  // const $isNavigateBlocked = VerificationStore.$isNavigateBlocked;
  // useBlocker({
  //   condition: $isNavigateBlocked.value,
  //   blockerFn: async () => {
  //     if (!$isNavigateBlocked.peek()) return true;
  //     const res = await promptModal({
  //       title: 'Are you sure?',
  //       text: 'Leaving this page will reject verification',
  //       actions: [
  //         { label: 'Reject verification', value: 'Reject', variant: 'light', color: 'danger' },
  //         { label: 'Continue verification', value: 'Cancel', variant: 'shadow', color: 'success' },
  //       ],
  //     });
  //     if (res === 'Reject') VerificationTerminateActions.rejectByUser().then();
  //     return false;
  //   },
  // });

  if (initDataState.isLoading) return <VerificationPendingView />;
  if (initDataState.isError) throw initDataState.error;
  if (!initDataState.isSuccess) throw new Error('Verification is not initialized');

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
      <div className="grow flex justify-center">
        {computed(() => holyCrapWhatsLoadingNow ? <ApproximateSpin
          label={holyCrapWhatsLoadingNow.text}
          isSlow={[
            HolyCrapWhatsLoadingNowStageEnum.ProofCache,
            HolyCrapWhatsLoadingNowStageEnum.ProofCreate,
          ].includes(holyCrapWhatsLoadingNow.stage)}
          isLabelRight
        /> : null)}
      </div>
      <ProvePageButtons />
    </PageContainer>
  );
}

function VerificationPendingView() {
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

function VerificationErrorView({ error, reset }: Pick<ErrorComponentProps, 'error' | 'reset'>) {
  const _reset = () => {
    reset();
    VerificationInitActions.restart().then();
  };

  return <ErrorView error={error} reset={_reset} />;
}
