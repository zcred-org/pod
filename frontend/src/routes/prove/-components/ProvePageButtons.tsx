import { Button } from '@nextui-org/react';
import { ProofStore } from '@/stores/proof.store.ts';

const {
  $credentialsAsync,
  $credentialUpsert,
  $cantContinueReason,
  $proofSigningAsync,
  $proofAsync,
  $credential,
  proofCreate,
  signChallenge,
  $credentialUpsertAsync,
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
    {!$credentialUpsert.value && !$proofAsync.value.isSuccess && <Button
      className="grow"
      color="success"
      isLoading={$proofAsync.value.isLoading || $credentialsAsync.value.isLoading}
      isDisabled={!$credential.value || !!$cantContinueReason.value}
      onClick={proofCreate}
    >Create proof</Button>}
    {$proofAsync.value.isSuccess && <Button
      className="grow"
      color="success"
      isLoading={$proofSigningAsync.value.isLoading}
      onClick={signChallenge}
      isDisabled={$proofSigningAsync.value.isSuccess || !!$cantContinueReason.value}
    >Sign challenge</Button>}
  </>);
}
