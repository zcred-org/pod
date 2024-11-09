import { type QueryFunctionContext, queryOptions } from '@tanstack/react-query';
import { queryClient } from '@/config/query-client.ts';
import { zCredStore } from '@/service/external/zcred-store';
import { queryKey, type ZkpResultQueryKey } from '@/service/queries/query-key.ts';
import { Ms } from '@/util/independent/ms.ts';


function queryFn(ctx: QueryFunctionContext<ZkpResultQueryKey>) {
  const { signal, queryKey: { 2: { jalId } } } = ctx;
  return zCredStore.zkpResultCache.get({ jalId, signal });
}

queryClient.setQueryDefaults(queryKey.zkpResult.ROOT, {
  gcTime: Ms.minute(5),
  staleTime: Ms.minute(5),
});

export function zkpResultQuery(jalId: string) {
  return queryOptions({
    queryKey: queryKey.zkpResult.get(jalId),
    queryFn,
  });
}

zkpResultQuery.fetch = (...args: Parameters<typeof zkpResultQuery>) => queryClient.fetchQuery(zkpResultQuery(...args));
zkpResultQuery.prefetch = (...args: Parameters<typeof zkpResultQuery>) => queryClient.prefetchQuery(zkpResultQuery(...args));
zkpResultQuery.invalidateROOT = () => queryClient.invalidateQueries({ queryKey: queryKey.zkpResult.ROOT });
