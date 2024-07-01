import { Button, Card, CardBody, CardHeader, Divider, Progress, Skeleton, Textarea } from '@nextui-org/react';
import { computed } from '@preact/signals-react';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { z } from 'zod';
import { SwitchToRequiredIdModal } from '@/components/modals/SwitchToRequiredIdModal.tsx';
import { PageContainer } from '@/components/PageContainer.tsx';
import { ProveCredentialSelect } from '@/routes/prove/-components/ProveCredentialSelect.tsx';
import { ProveFriendlyJAL } from '@/routes/prove/-components/ProveFriendlyJAL.tsx';
import { ProvePageButtons } from '@/routes/prove/-components/ProvePageButtons.tsx';
import { ProveTitleText } from '@/routes/prove/-components/ProveTitleText.tsx';
import { $isWalletAndDidConnected } from '@/stores/other.ts';
import { ProofStore } from '@/stores/proof.store.ts';
import { WalletStore } from '@/stores/wallet.store.ts';


const {
  $isSubjectMatch,
  $requiredId,
  $proofAsync,
  $cantContinueReason,
  $proposalComment,
} = ProofStore;

export const Route = createFileRoute('/prove')({
  component: () => <ProveComponent />,
  validateSearch: z.object({
    proposalURL: z.string(),
    SDID: z.string(),
  }),
  pendingComponent: PendingComponent,
  beforeLoad: ({ search, cause }) => {
    if (!$isWalletAndDidConnected.value && cause !== 'preload') {
      throw redirect({ to: '/', search: { proposalURL: search.proposalURL } });
    }
    const verifierHost = new URL(search.proposalURL).host;
    return { title: `Prove for ${verifierHost}` };
  },
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => await ProofStore.proveStorePrepare(deps),
});

function ProveComponent() {
  const wallet = WalletStore.$wallet.value;

  if (!$isSubjectMatch.value) {
    return <SwitchToRequiredIdModal requiredId={$requiredId.value} subjectId={wallet!.subjectId} />;
  }

  return (
    <PageContainer>
      <ProveTitleText />
      <ProveFriendlyJAL />
      <ProveCredentialSelect />
      {$proposalComment.value ? <Textarea
        label="Comment"
        defaultValue={$proposalComment.value}
        isReadOnly isRequired
        minRows={1}
      /> : null}
      {computed(() => $cantContinueReason.value && <Textarea
        label="Can't continue"
        value={$cantContinueReason.value}
        isReadOnly isRequired
        color="danger"
        minRows={1}
      />)}
      <div className="grow">
        {computed(() => $proofAsync.value.isLoading && <Progress
          isIndeterminate
          label="Creating a proof..."
        />)}
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
