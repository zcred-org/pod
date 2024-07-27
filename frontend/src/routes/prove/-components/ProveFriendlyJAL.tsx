import { FriendlyZCredTranslator } from '@jaljs/friendly-zcred';
import { Card, CardBody, CardHeader, Divider } from '@nextui-org/react';
import { computed } from '@preact/signals-react';
import { type FC, type ReactNode } from 'react';
import { VerificationStore } from '@/stores/verification-store/verification-store.ts';

const $credentialType = computed<string>(() => {
  return VerificationStore.$credential.value?.data.attributes.type || VerificationStore.$initDataAsync.value.data?.issuerInfo?.credential.type || 'unknown';
});

const $credentialFriendlyJal = computed<ReactNode | undefined>(() => {
  const initData = VerificationStore.$initDataAsync.value.data;
  const credential = VerificationStore.$credential.value;
  const program = initData?.proposal.program;

  const definitions = credential?.data.meta.definitions.attributes
    || initData?.issuerInfo?.definitions.attributes;
  const friendlyJal = program && definitions
    && new FriendlyZCredTranslator(program, definitions).translate();

  return friendlyJal
    ?.split('\n')
    .map((line, i) => line ? <p key={i}>{line}</p> : <p key={i}>&nbsp;</p>);
});

export const ProveFriendlyJAL: FC = () => (<>
  <Card shadow="none" className="border-2 border-foreground-200">
    <CardHeader className="text-xl font-bold">{$credentialType}</CardHeader>
    <Divider />
    <CardBody>
      {$credentialFriendlyJal}
    </CardBody>
  </Card>
</>);
