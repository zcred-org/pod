import { VerificationStore } from '@/stores/verification-store/verification-store.ts';


const {
  $initDataAsync,
  $isIssuanceRequired,
} = VerificationStore;

export function ProveTitleText() {
  return $isIssuanceRequired.value ? (
    <p>
      <span className="underline">{$initDataAsync.value?.data?.verifierHost}</span>
      {' asks you to receive a credential from '}
      <span className="underline">{$initDataAsync.value?.data?.issuerHost}</span>
      {' and create a proof:'}
    </p>
  ) : (
    <p>
      <span className="underline">{$initDataAsync.value?.data?.verifierHost}</span>
      {' asks you to create a proof:'}
    </p>
  );
}
