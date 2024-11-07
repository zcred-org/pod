import { type QueryFunctionContext, queryOptions } from '@tanstack/react-query';
import { queryClient } from '@/config/query-client.ts';
import { zCredStore } from '@/service/external/zcred-store';
import { credentialsInfiniteQuery } from '@/service/queries/credentials.query.ts';
import { type CredentialQueryKey, queryKey } from '@/service/queries/query-key.ts';
import { Ms } from '@/util/independent/ms.ts';


function queryFn(ctx: QueryFunctionContext<CredentialQueryKey>) {
  const { signal, queryKey: { 2: credentialId } } = ctx;
  return zCredStore.credential.credentialById({ id: credentialId, signal });
}

export function credentialQuery(credentialId: string) {
  return queryOptions({
    queryKey: queryKey.credential.get(credentialId),
    queryFn,
    staleTime: Ms.minute(10),
    initialData: () => credentialsInfiniteQuery.getData()
      ?.pages
      .flatMap(p => p.credentials)
      .find(c => c.id === credentialId),
    initialDataUpdatedAt: queryClient.getQueryState(credentialsInfiniteQuery().queryKey)?.dataUpdatedAt,
  });
}

credentialQuery.prefetch = function (...args: Parameters<typeof credentialQuery>) {
  return queryClient.prefetchQuery(credentialQuery(...args));
};

credentialQuery.invalidateROOT = function () {
  return queryClient.invalidateQueries({ queryKey: queryKey.credential.ROOT });
};
