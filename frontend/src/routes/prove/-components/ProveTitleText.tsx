import { ProofStore } from '@/stores/proof.store.ts';

const {
  $credentialUpsert,
  $verifierHost,
  $issuerHost,
}= ProofStore;

export function ProveTitleText() {
  return (<>
    {$credentialUpsert.value?.isIssue ? <p>
      <span className="underline">{$verifierHost}</span>
      {' asks you to receive a credential from '}
      <span className="underline">{$issuerHost}</span>
      {' and create a proof:'}
    </p> : null}
    {$credentialUpsert.value?.isUpdate ? <p>
      <span className="underline">{$verifierHost}</span>
      {' asks you to update a credential and create a proof:'}
    </p> : null}
    {!$credentialUpsert.value && <p>
      <span className="underline">{$verifierHost}</span>
      {' asks you to create a proof:'}
    </p>}
  </>);
}
