import { type QueryFunctionContext, queryOptions } from '@tanstack/react-query';
import { queryClient } from '@/config/query-client.ts';
import { VerifierApi } from '@/service/external/verifier/verifier-api.ts';
import { queryKey, type ProposalQueryKey } from '@/service/queries/query-key.ts';
import { Ms } from '@/util/independent/ms.ts';


async function queryFn(ctx: QueryFunctionContext<ProposalQueryKey>) {
  const { signal, queryKey: { 1: args } } = ctx;
  return await VerifierApi.proposalGet({
    proposalURL: args.proposalURL,
    signal,
  });
}

queryClient.setQueryDefaults(queryKey.proposal.ROOT, {
  gcTime: Ms.minute(5),
  staleTime: Ms.minute(5), // TODO: when verification session will expire?
  retry: 2, // 3 fetches total
  refetchOnMount: false,
  refetchOnReconnect: false,
  refetchOnWindowFocus: false,
});

export function proposalQuery(proposalURL: string) {
  return queryOptions({
    queryKey: queryKey.proposal.get(proposalURL),
    queryFn,
  });
}

proposalQuery.fetch = (...args: Parameters<typeof proposalQuery>) => queryClient.fetchQuery(proposalQuery(...args));
proposalQuery.invalidateROOT = () => queryClient.invalidateQueries({ queryKey: queryKey.proposal.ROOT });
