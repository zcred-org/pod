import { type QueryFunctionContext, queryOptions } from '@tanstack/react-query';
import { queryClient } from '@/config/query-client.ts';
import { zCredStore } from '@/service/external/zcred-store';
import { queryKey, type ZkpResultQueryKey } from '@/service/queries/query-key.ts';


function queryFn(ctx: QueryFunctionContext<ZkpResultQueryKey>) {
  const { signal, queryKey: { 1: jalId } } = ctx;
  return zCredStore.zkpResultCache.get({ jalId, signal });
}

export function zkpResultQuery(jalId: string) {
  return queryOptions({
    queryKey: queryKey.zkpResult.get(jalId),
    queryFn,
    staleTime: 10 * 60e3, // 10 minutes
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
