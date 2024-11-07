import { Select, SelectItem } from '@nextui-org/react';
import { useInfiniteScroll } from '@nextui-org/use-infinite-scroll';
import { computed } from '@preact/signals-react';
import Avvvatar from 'avvvatars-react';
import { type FC, useState } from 'react';
import { CredentialCard } from '@/components/CredentialCard.tsx';
import { credentialsInfiniteQuery } from '@/service/queries/credentials.query.ts';
import { VerificationCredentialsActions } from '@/stores/verification-store/verification-credentials-actions.ts';
import { VerificationStore } from '@/stores/verification-store/verification-store.ts';
import { tryToLocalDateTime } from '@/util/independent/date.ts';


const {
  $credentialsAsync,
  $credential,
  $proofCreateAsync,
  $terminateAsync,
} = VerificationStore;

const $credentialsNotProvableIds = computed<string[]>(() => {
  return $credentialsAsync.value.data.reduce<string[]>((acc, cred) => {
    return cred.isProvable ? acc : [...acc, cred.id];
  }, []);
});

const $query = credentialsInfiniteQuery.$signal;


export const ProveCredentialSelect: FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [, scrollRef] = useInfiniteScroll({
    hasMore: $query.hasNextPage,
    shouldUseLoader: false,
    isEnabled: isOpen && !$query.isFetching,
    onLoadMore: () => {
      const lastPageParams = $query.data?.pageParams.at(-1);
      const offsetNext = (lastPageParams?.offset || 0) + (lastPageParams?.limit || 0);
      VerificationCredentialsActions.$refetchNoWait(offsetNext);
    },
  });


  return (<>
    {$credentialsAsync.value.data.length > 1 ? <Select
      className="shadow-amber-500"
      items={$credentialsAsync.value.data}
      isRequired={!$credential.value}
      color={$credential.value ? undefined : 'warning'}
      variant={$credential.value ? 'faded' : undefined}
      selectedKeys={$credential.value ? [$credential.value.id] : []}
      label={$credential.value ? 'Credential will be used:' : 'Select a credential:'}
      labelPlacement="outside"
      disabledKeys={$credentialsNotProvableIds.value}
      placeholder="Please select one from the list"
      isLoading={$credentialsAsync.value.isLoading}
      isDisabled={$proofCreateAsync.value.isLoading || $proofCreateAsync.value.isSuccess || !$terminateAsync.value.isIdle}
      description={!$credential.value && $credentialsAsync.value.data.at(0)?.isProvable && $credentialsAsync.value.data.at(1)?.isProvable
        ? 'You have more than one suitable credential, please specify which one you would like to use'
        : $credential.value
          ? `from ${new URL($credential.value.data.meta.issuer.uri).host}, ${tryToLocalDateTime($credential.value.data.attributes.issuanceDate)}`
          : undefined}
      errorMessage={!$credentialsAsync.value.data.at(0)?.isProvable
        ? 'You do not have any suitable credentials'
        : undefined}
      classNames={{ helperWrapper: 'pb-0' }}
      renderValue={([item]) => !item?.data ? null : item.data.data.attributes.type}
      endContent={$credential.value ? <Avvvatar value={$credential.value.id} style="shape" radius={6} size={20} /> : null}
      onOpenChange={setIsOpen}
      scrollRef={scrollRef}
    >{item => (
      <SelectItem textValue={item.data.attributes.type} key={item.id} value={item.id}>
        <CredentialCard credential={item} onClick={() => void ($credential.value = item)} />
      </SelectItem>
    )}</Select> : null}
  </>);
};
