import { VerificationStore } from '@/stores/verification-store/verification-store.ts';

const {
  $initDataAsync,
  $credentialUpsertInfo,
} = VerificationStore;

export function ProveTitleText() {
  return (<>
    {$credentialUpsertInfo.value?.isIssue ? <p>
      <span className="underline">{$initDataAsync.value?.data?.verifierHost}</span>
      {' asks you to receive a credential from '}
      <span className="underline">{$initDataAsync.value?.data?.issuerHost}</span>
      {' and create a proof:'}
    </p> : null}
    {$credentialUpsertInfo.value?.isUpdate ? <p>
      <span className="underline">{$initDataAsync.value?.data?.verifierHost}</span>
      {' asks you to update a credential and create a proof:'}
    </p> : null}
    {!$credentialUpsertInfo.value && <p>
      <span className="underline">{$initDataAsync.value?.data?.verifierHost}</span>
      {' asks you to create a proof:'}
    </p>}
  </>);
}
