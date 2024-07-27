import { Button } from '@nextui-org/react';
import { VerificationActions } from '@/stores/verification-store/verification-actions.ts';
import { VerificationStore } from '@/stores/verification-store/verification-store.ts';
import { VerificationTerminateActions } from '@/stores/verification-store/verification-terminate-actions.ts';


export function ProvePageButtons() {
  const {
    $credentialsAsync,
    $credentialUpsertAsync,
    $credentialUpsertInfo,
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
        $credentialUpsertAsync.value.isLoading
        || $proofCreateAsync.value.isLoading
        || $proofSignAsync.value.isLoading
        || $proofSendAsync.value.isLoading
      }
    >Reject</Button>

    {$terminateAsync.value.isIdle && (<>
      {$credentialUpsertInfo.value && <Button
        className="grow"
        color="success"
        isLoading={$credentialUpsertAsync.value.isLoading}
        onClick={VerificationActions.credentialUpsert}
      >{$credentialUpsertInfo.value.isIssue ? 'Issue credential' : 'Update credential'}</Button>}

      {!$credentialUpsertInfo.value && !$proofCreateAsync.value.isSuccess && <Button
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
