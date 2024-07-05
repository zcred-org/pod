import { Select, SelectItem } from '@nextui-org/react';
import { computed } from '@preact/signals-react';
import type { FC } from 'react';
import { CredentialCard } from '@/components/CredentialCard.tsx';
import { ProofStore } from '@/stores/proof.store.ts';

const {
  $credentialsAsync,
  $credential,
  $proofCreateAsync,
  $cantContinueReason,
} = ProofStore;

const $credentialsNotProvableIds = computed<string[]>(() => {
  return $credentialsAsync.value.data.reduce<string[]>((acc, cred) => {
    return cred.isProvable ? acc : [...acc, cred.id];
  }, []);
});

export const ProveCredentialSelect: FC = () => (<>
  {$credentialsAsync.value.data.length > 1 && !$cantContinueReason.value ? <Select
    className="shadow-amber-500"
    items={$credentialsAsync.value.data}
    isRequired={!$credential}
    color={$credential ? undefined : 'warning'}
    variant={$credential ? 'faded' : undefined}
    selectedKeys={$credential.value ? [$credential.value.id] : []}
    label="Credential"
    disabledKeys={$credentialsNotProvableIds.value}
    placeholder="Select a credential"
    isLoading={$credentialsAsync.value.isLoading}
    isDisabled={$proofCreateAsync.value.isLoading || $proofCreateAsync.value.isSuccess}
    description={$credentialsAsync.value.data.at(0)?.isProvable && $credentialsAsync.value.data.at(1)?.isProvable
      ? 'You have more than one suitable credential, please specify which one you would like to use'
      : undefined}
    errorMessage={!$credentialsAsync.value.data.at(0)?.isProvable
      ? 'You do not have any suitable credentials'
      : undefined}
    classNames={{ helperWrapper: 'pb-0' }}
    renderValue={([item]) => item?.data?.id}
  >{item => (
    <SelectItem key={item.id} value={item.id}>
      <CredentialCard credential={item} onClick={() => void ($credential.value = item)} />
    </SelectItem>
  )}</Select> : null}
</>);
