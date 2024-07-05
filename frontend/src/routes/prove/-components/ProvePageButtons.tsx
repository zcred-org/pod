import { Button } from '@nextui-org/react';
import { ProofStore } from '@/stores/proof.store.ts';

const {
  $cantContinueReason,

  $credentialsAsync,
  $credentialUpsertAsync,
  $credentialUpsert,
  $credential,

  $proofCreateAsync,
  proofCreate,

  $proofSignAsync,
  proofSign,

  $proofSendAsync,
  proofSend,
} = ProofStore;

export function ProvePageButtons() {
  return (<>
    <Button
      className="grow"
      variant="light"
      color="danger"
      onClick={() => window.location.href = document.referrer}
    >Reject</Button>

    {$credentialUpsert.value && <Button
      className="grow"
      color="success"
      isLoading={$credentialUpsertAsync.value.isLoading}
      onClick={$credentialUpsert.value.fn}
      isDisabled={!!$cantContinueReason.value}
    >{$credentialUpsert.value.isIssue ? 'Issue credential' : 'Update credential'}</Button>}

    {!$credentialUpsert.value && !$proofCreateAsync.value.isSuccess && <Button
      className="grow"
      color="success"
      isLoading={$proofCreateAsync.value.isLoading || $credentialsAsync.value.isLoading}
      isDisabled={!$credential.value || !!$cantContinueReason.value}
      onClick={proofCreate}
    >Create proof</Button>}

    {$proofCreateAsync.value.isSuccess && !$proofSignAsync.value.isSuccess && <Button
      className="grow"
      color="success"
      isLoading={$proofSignAsync.value.isLoading}
      onClick={proofSign}
      isDisabled={$proofSignAsync.value.isSuccess || !!$cantContinueReason.value}
    >Sign challenge</Button>}

    {$proofSignAsync.value.isSuccess && <Button
      className="grow"
      color="success"
      isLoading={$proofSendAsync.value.isLoading}
      onClick={proofSend}
      isDisabled={$proofSendAsync.value.isSuccess || !!$cantContinueReason.value}
    >Send proof</Button>}
  </>);
}
