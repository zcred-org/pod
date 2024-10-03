import { FriendlyZCredTranslator } from '@jaljs/friendly-zcred';
import { Divider } from '@nextui-org/react';
import { computed } from '@preact/signals-react';
import { type FC, type ReactNode } from 'react';
import { VerificationStore } from '@/stores/verification-store/verification-store.ts';


const {
  $credential,
  $initDataAsync,
  $isIssuanceRequired,
} = VerificationStore;

const $credentialType = computed<string>(() => {
  return $credential.value?.data.attributes.type || $initDataAsync.value.data?.issuerInfo?.credential.type || 'unknown';
});

const $credentialFriendlyJal = computed<ReactNode | undefined>(() => {
  const initData = $initDataAsync.value.data;
  const credential = $credential.value;
  const program = initData?.proposal.program;

  const definitions = credential?.data.meta.definitions.attributes
    || initData?.issuerInfo?.definitions.attributes;
  const friendlyJal = program && definitions
    && new FriendlyZCredTranslator(program, definitions).translate();

  return friendlyJal?.replace(/(?<=you will prove:)\s+/i, '\n')
    ?.split('\n')
    .map((line, i) => line ? <p key={i}>{line}</p> : <p key={i}>&nbsp;</p>);
});

export const ProveDescription: FC = () => (<>
  <div className="text-xl">
    {$isIssuanceRequired.value ? (
      <p>
        <u>{$initDataAsync.value?.data?.verifierHost}</u>
        {' asks you to receive a "'}
        <b>{$credentialType}</b>
        {'" credential from '}
        <u>{$initDataAsync.value?.data?.issuerHost}</u>
        {' and create a proof:'}
      </p>
    ) : (
      <p>
        <u>{$initDataAsync.value?.data?.verifierHost}</u>
        {' asks you to create a proof using your "'}
        <b>{$credentialType}</b>
        {'" credential from '}
        <u>{$initDataAsync.value?.data?.issuerHost}</u>
        {':'}
      </p>
    )}
  </div>
  <Divider />
  <div>
    {$credentialFriendlyJal}
  </div>
</>);
