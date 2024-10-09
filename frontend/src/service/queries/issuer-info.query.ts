import { queryOptions } from '@tanstack/react-query';
import type { HttpIssuer, Info } from '@zcredjs/core';
import { queryClient } from '@/config/query-client.ts';
import { queryKey } from '@/service/queries/query-key.ts';


export function issuerInfoQuery(httpIssuer: HttpIssuer) {
  return queryOptions({
    queryKey: queryKey.issuer.info(httpIssuer.uri.href),
    queryFn: async (): Promise<Info> => await httpIssuer.getInfo().catch(e => {
      console.error('Failed to fetch issuer info:', e);
      throw e;
    }),
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 2, // 3 fetches total
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });
}

issuerInfoQuery.invalidateROOT = async () => {
  return queryClient.invalidateQueries({ queryKey: queryKey.issuer.ROOT });
};

issuerInfoQuery.fetch = function (...args: Parameters<typeof issuerInfoQuery>) {
  return queryClient.fetchQuery(issuerInfoQuery(...args));
};

issuerInfoQuery.getState = function (...args: Parameters<typeof issuerInfoQuery>) {
  return queryClient.getQueryState(issuerInfoQuery(...args).queryKey);
};
