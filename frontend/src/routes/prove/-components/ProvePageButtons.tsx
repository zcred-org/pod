import { Button, type ButtonProps } from '@nextui-org/react';
import type { ReactNode } from 'react';
import { SessionPersistedStore } from '@/stores/session-persisted.store.ts';
import { VerificationIssueActions } from '@/stores/verification-store/verification-issue-actions.ts';
import { VerificationProofActions } from '@/stores/verification-store/verification-proof-actions.ts';
import { VerificationStore, HolyCrapWhatsLoadingNow } from '@/stores/verification-store/verification-store.ts';
import { VerificationTerminateActions } from '@/stores/verification-store/verification-terminate-actions.ts';


export function ProvePageButtons(): ReactNode {
  const {
    $credentialIssueAsync,

    $proofCreateAsync,
    $proofSignAsync,
    $proofSendAsync,

    $terminateAsync,
  } = VerificationStore;

  return (
    <div className="flex gap-3 [&>*]:grow">
      <Button
        variant="light"
        color="danger"
        onClick={VerificationTerminateActions.rejectByUser}
        isLoading={$terminateAsync.value.isLoading}
        isDisabled={
          $credentialIssueAsync.value.isLoading
          || $proofCreateAsync.value.isLoading
          || $proofSignAsync.value.isLoading
          || $proofSendAsync.value.isLoading
        }
      >Reject</Button>
      {$terminateAsync.value.isIdle && <MainButton />}
    </div>
  );
}

function MainButton(): ReactNode {
  const {
    $credentialsAsync, $credential, $isIssuanceRequired, $credentialIssueAsync,
    $proofCacheAsync, $proofCreateAsync, $proofSignAsync, $proofSendAsync,
    $holyCrapWhatsLoadingNow,
  } = VerificationStore;
  const challenge = SessionPersistedStore.session.value?.challenge;

  const propsOnLoading: ButtonProps | undefined = ({
    [HolyCrapWhatsLoadingNow.Terminate]: undefined,
    [HolyCrapWhatsLoadingNow.ProofSend]: { isLoading: true, children: 'Sending...' },
    [HolyCrapWhatsLoadingNow.ProofCreate]: { isLoading: true, children: 'Creating...' },
    [HolyCrapWhatsLoadingNow.Credentials]: { isLoading: true, children: 'Searching...' },
    [HolyCrapWhatsLoadingNow.ProofCache]: { isLoading: true, children: 'Searching...' },
    'default': undefined,
  })[$holyCrapWhatsLoadingNow.value?.value ?? 'default'];

  const props: ButtonProps = propsOnLoading || ($isIssuanceRequired.value ? {
    children: 'Get credential',
    onClick: challenge ? () => VerificationIssueActions.finish(challenge) : VerificationIssueActions.start,
    isLoading: $credentialIssueAsync.value.isLoading,
  } : !$proofCreateAsync.value.isSuccess ? {
    children: 'Prove', onClick: VerificationProofActions.proofCreate,
    isLoading: $proofCacheAsync.value.isLoading || $proofCreateAsync.value.isLoading,
    isDisabled: !$credential.value || $credentialsAsync.value.isLoading,
  } : !$proofSignAsync.value.isSuccess ? {
    children: 'Send proof', onClick: VerificationProofActions.proofSign,
    isLoading: $proofSignAsync.value.isLoading,
  } : /*$proofSignAsync.value.isSuccess ?*/ {
    children: 'Send proof', onClick: VerificationProofActions.proofSend,
    isLoading: $proofSendAsync.value.isLoading,
    isDisabled: $proofSendAsync.value.isSuccess,
  });

  return <Button color="success" {...props} />;
}
