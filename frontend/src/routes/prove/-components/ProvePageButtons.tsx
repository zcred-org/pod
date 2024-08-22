import { Button } from '@nextui-org/react';
import { VerificationActions } from '@/stores/verification-store/verification-actions.ts';
import { VerificationStore } from '@/stores/verification-store/verification-store.ts';
import { VerificationTerminateActions } from '@/stores/verification-store/verification-terminate-actions.ts';


export function ProvePageButtons() {
  const {
    $credentialsAsync,
    $credentialIssueAsync,
    $isIssuanceRequired,
    $credential,

    $proofCreateAsync,
    $proofSignAsync,
    $proofSendAsync,

    $terminateAsync,
  } = VerificationStore;


  return (<>
    <Button
      className="grow"
      variant="light"
      color="danger"
      onClick={VerificationTerminateActions.rejectByUser}
      isLoading={$terminateAsync.value.isLoading}
      isDisabled={
        $credentialsAsync.value.isLoading
        || $credentialIssueAsync.value.isLoading
        || $proofCreateAsync.value.isLoading
        || $proofSignAsync.value.isLoading
        || $proofSendAsync.value.isLoading
      }
    >Reject</Button>

    {$terminateAsync.value.isIdle && (<>
      {$isIssuanceRequired.value && <Button
        className="grow"
        color="success"
        isLoading={$credentialIssueAsync.value.isLoading}
        onClick={VerificationActions.credentialIssue}
      >Issue credential</Button>}

      {!$isIssuanceRequired.value && !$proofCreateAsync.value.isSuccess && <Button
        className="grow"
        color="success"
        isLoading={$proofCreateAsync.value.isLoading || $credentialsAsync.value.isLoading}
        isDisabled={!$credential.value}
        onClick={VerificationActions.proofCreate}
      >Create proof</Button>}

      {$proofCreateAsync.value.isSuccess && !$proofSignAsync.value.isSuccess && <Button
        className="grow"
        color="success"
        isLoading={$proofSignAsync.value.isLoading}
        onClick={VerificationActions.proofSign}
      >Sign challenge</Button>}

      {$proofSignAsync.value.isSuccess && <Button
        className="grow"
        color="success"
        isLoading={$proofSendAsync.value.isLoading}
        onClick={VerificationActions.proofSend}
        isDisabled={$proofSendAsync.value.isSuccess}
      >Send proof</Button>}
    </>)}
  </>);
}
