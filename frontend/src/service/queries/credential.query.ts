import { type QueryFunctionContext, queryOptions } from '@tanstack/react-query';
import { queryClient } from '@/config/query-client.ts';
import { zCredStore } from '@/service/external/zcred-store';
import { credentialsInfiniteQuery } from '@/service/queries/credentials.query.ts';
import { type CredentialQueryKey, queryKey } from '@/service/queries/query-key.ts';
import { Ms } from '@/util/independent/ms.ts';


function queryFn(ctx: QueryFunctionContext<CredentialQueryKey>) {
  const { signal, queryKey: { 2: { credentialId } } } = ctx;
  return zCredStore.credential.credentialById({ id: credentialId, signal });
}

queryClient.setQueryDefaults(queryKey.credential.ROOT, {
  staleTime: Ms.minute(10),
});

export function credentialQuery(credentialId: string) {
  return queryOptions({
    queryKey: queryKey.credential.get(credentialId),
    queryFn,
    initialData: () => credentialsInfiniteQuery.getData()
      ?.pages
      .flatMap(p => p.credentials)
      .find(c => c.id === credentialId),
    initialDataUpdatedAt: () => queryClient.getQueryState(credentialsInfiniteQuery().queryKey)?.dataUpdatedAt,
  });
}

credentialQuery.invalidateROOT = () => queryClient.invalidateQueries({ queryKey: queryKey.credential.ROOT });
credentialQuery.prefetch = (...args: Parameters<typeof credentialQuery>) => queryClient.prefetchQuery(credentialQuery(...args));
