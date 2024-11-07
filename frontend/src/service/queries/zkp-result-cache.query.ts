import { type QueryFunctionContext, queryOptions } from '@tanstack/react-query';
import { queryClient } from '@/config/query-client.ts';
import { zCredStore } from '@/service/external/zcred-store';
import { queryKey, type ZkpResultQueryKey } from '@/service/queries/query-key.ts';
import { Ms } from '@/util/independent/ms.ts';


function queryFn(ctx: QueryFunctionContext<ZkpResultQueryKey>) {
  const { signal, queryKey: { 2: jalId } } = ctx;
  return zCredStore.zkpResultCache.get({ jalId, signal });
}

export function zkpResultQuery(jalId: string) {
  return queryOptions({
    queryKey: queryKey.zkpResult.get(jalId),
    queryFn,
    staleTime: Ms.minute(10),
  });
}

zkpResultQuery.fetch = function (...args: Parameters<typeof zkpResultQuery>) {
  return queryClient.fetchQuery(zkpResultQuery(...args));
};

zkpResultQuery.prefetch = function (...args: Parameters<typeof zkpResultQuery>) {
  return queryClient.prefetchQuery(zkpResultQuery(...args));
};

zkpResultQuery.invalidateROOT = function () {
  return queryClient.invalidateQueries({ queryKey: queryKey.zkpResult.ROOT });
};
