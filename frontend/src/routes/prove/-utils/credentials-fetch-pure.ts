import type { Info } from '@zcredjs/core';
import { zCredStore } from '@/service/external/zcred-store';
import type { ZCredStore } from '@/service/external/zcred-store/api-specification.ts';
import type { O1JSCredentialFilter } from '@/service/o1js-credential-filter';
import type { CredentialMarked } from '@/types/credentials-marked.ts';
import type { CredentialsSearchInput } from '@/types/credentials-search-input.ts';

function credentialsMarkAndSortPure(
  { credentials, issuerInfo, credentialFilter }: {
    credentials: ZCredStore['CredentialDecoded'][],
    issuerInfo?: Info,
    credentialFilter: O1JSCredentialFilter,
  },
): CredentialMarked[] {
  return credentials.map(cred => ({
    // Mark credentials that are updatable and provable
    ...cred,
    isUpdatable: !!issuerInfo?.proofs.updatable && issuerInfo.proofs.updatedAt > cred.data.attributes.issuanceDate,
    isProvable: credentialFilter.execute(cred.data),
  })).sort((a, b) => {
    // Provable are first, then new issued first
    if (a.isProvable && !b.isProvable) return -1;
    if (!a.isProvable && b.isProvable) return 1;
    return new Date(b.data.attributes.issuanceDate).getTime() - new Date(a.data.attributes.issuanceDate).getTime();
  });
}

export async function credentialsFetchPure(
  { credentialFilter, issuerInfo, filter, credentialSelectedId }: {
    credentialFilter: O1JSCredentialFilter,
    issuerInfo?: Info,
    filter: CredentialsSearchInput,
    credentialSelectedId: string | undefined,
  },
) {
  // Fetch & check & sort credentials
  const credentials = credentialsMarkAndSortPure({
    credentials: await zCredStore.credential.credentials(filter),
    credentialFilter,
    issuerInfo,
  });
  const isAutoSelectFirst: boolean = !!credentials.at(0)?.isProvable && !credentials.at(1)?.isProvable;
  const isSelectedNotFound: boolean = !!credentialSelectedId
    && !credentials.some(({ id, isProvable }) => id === credentialSelectedId && isProvable);
  return { credentials, isAutoSelectFirst, isSelectedNotFound };
}
