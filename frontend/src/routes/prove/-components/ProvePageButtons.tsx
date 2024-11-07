import type { ReactNode } from 'react';
import { Button, type ButtonProps } from '@/components/ui/Button.tsx';
import { VerificationIssueActions } from '@/stores/verification-store/verification-issue-actions.ts';
import { VerificationProofActions } from '@/stores/verification-store/verification-proof-actions.ts';
import { VerificationStore, HolyCrapWhatsLoadingNowStageEnum } from '@/stores/verification-store/verification-store.ts';
import { VerificationTerminateActions } from '@/stores/verification-store/verification-terminate-actions.ts';
import { ZCredIssueStore } from '@/stores/z-cred-issue.store.ts';


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
  const challenge = ZCredIssueStore.session.value?.challenge;

  const propsOnLoading: ButtonProps | undefined = ({
    [HolyCrapWhatsLoadingNowStageEnum.Terminate]: undefined,
    [HolyCrapWhatsLoadingNowStageEnum.ProofSend]: { isLoading: true, children: 'Sending...' },
    [HolyCrapWhatsLoadingNowStageEnum.ProofCreate]: { isLoading: true, children: 'Creating...' },
    [HolyCrapWhatsLoadingNowStageEnum.Credentials]: { isLoading: true, children: 'Searching...' },
    [HolyCrapWhatsLoadingNowStageEnum.ProofCache]: { isLoading: true, children: 'Searching...' },
    'default': undefined,
  })[$holyCrapWhatsLoadingNow.value?.stage ?? 'default'];

  const props: ButtonProps = propsOnLoading || ($isIssuanceRequired.value ? {
    children: challenge ? 'Sign credential' : 'Get credential',
    onClick: challenge ? () => VerificationIssueActions.finish(challenge) : VerificationIssueActions.start,
    isLoading: $credentialIssueAsync.value.isLoading,
  } : !$proofCreateAsync.value.isSuccess ? {
    children: 'Prove', onClick: VerificationProofActions.proofCreate,
    isLoading: $proofCacheAsync.value.isLoading || $proofCreateAsync.value.isLoading,
    isDisabled: !$credential.value || $credentialsAsync.value.isLoading,
  } : !$proofSignAsync.value.isSuccess ? {
    children: 'Prove', onClick: VerificationProofActions.proofSign,
    isLoading: $proofSignAsync.value.isLoading,
  } : /*$proofSignAsync.value.isSuccess ?*/ {
    children: 'Prove', onClick: VerificationProofActions.proofSend,
    isLoading: $proofSendAsync.value.isLoading,
    isDisabled: $proofSendAsync.value.isSuccess,
  });

  return <Button
    color={props.isLoading ? 'default' : 'success'}
    {...props}
  />;
}
