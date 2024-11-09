import { queryOptions } from '@tanstack/react-query';
import type { HttpIssuer, Info } from '@zcredjs/core';
import { queryClient } from '@/config/query-client.ts';
import { queryKey } from '@/service/queries/query-key.ts';
import { Ms } from '@/util/independent/ms.ts';


queryClient.setQueryDefaults(queryKey.issuer.ROOT, {
  gcTime: Ms.minute(5),
  staleTime: Ms.minute(5),
  retry: 2, // 3 fetches total
  refetchOnMount: false,
  refetchOnReconnect: false,
  refetchOnWindowFocus: false,
});

export function issuerInfoQuery(httpIssuer: HttpIssuer) {
  return queryOptions({
    queryKey: queryKey.issuer.info(httpIssuer.uri.href),
    queryFn: async (): Promise<Info> => await httpIssuer.getInfo().catch(e => {
      console.error('Failed to fetch issuer info:', e);
      throw e;
    }),
  });
}


issuerInfoQuery.fetch = (...args: Parameters<typeof issuerInfoQuery>) => queryClient.fetchQuery(issuerInfoQuery(...args));
issuerInfoQuery.getState = (...args: Parameters<typeof issuerInfoQuery>) => queryClient.getQueryState(issuerInfoQuery(...args).queryKey);
issuerInfoQuery.invalidateROOT = () => queryClient.invalidateQueries({ queryKey: queryKey.issuer.ROOT });
