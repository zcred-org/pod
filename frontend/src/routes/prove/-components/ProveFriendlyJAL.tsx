import { FriendlyZCredTranslator } from '@jaljs/friendly-zcred';
import { Card, CardBody, CardHeader, Divider } from '@nextui-org/react';
import { computed } from '@preact/signals-react';
import { type FC, type ReactNode } from 'react';
import { ProofStore } from '@/stores/proof.store.ts';

const $credentialType = computed<string | undefined>(() => {
  return ProofStore.$credential.value?.data.attributes.type || ProofStore.$challengeInitData.value?.issuerInfo?.credential.type || 'unknown';
});

const $credentialFriendlyJal = computed<ReactNode | undefined>(() => {
  const challengeInitData = ProofStore.$challengeInitData.value;
  const credential = ProofStore.$credential.value;
  const program = challengeInitData?.proposal.program;

  const definitions = credential?.data.meta.definitions.attributes
    || challengeInitData?.issuerInfo?.definitions.attributes;
  const friendlyJal = program && definitions && new FriendlyZCredTranslator(program, definitions).translate();

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
