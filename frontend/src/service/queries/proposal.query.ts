import { type QueryFunctionContext, queryOptions } from '@tanstack/react-query';
import { queryClient } from '@/config/query-client.ts';
import { VerifierApi } from '@/service/external/verifier/verifier-api.ts';
import { queryKey, type ProposalQueryKey } from '@/service/queries/query-key.ts';
import type { VerificationStoreInitArgs } from '@/stores/verification-store/verification-store.ts';


async function queryFn(ctx: QueryFunctionContext<ProposalQueryKey>) {
  const { signal, queryKey: { 1: args } } = ctx;
  return await VerifierApi.proposalGet({
    proposalURL: args.proposalURL,
    signal,
  });
}

export function proposalQuery(args: VerificationStoreInitArgs) {
  return queryOptions({
    queryKey: queryKey.proposal.get(args),
    queryFn,
    staleTime: 5 * 60e3, // 5 minutes. TODO: when verification session will expire?
    gcTime: Infinity,
    retry: 2, // 3 fetches total
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });
}

proposalQuery.fetch = function (...args: Parameters<typeof proposalQuery>) {
  return queryClient.fetchQuery(proposalQuery(...args));
};

proposalQuery.invalidateROOT = function () {
  return queryClient.invalidateQueries({ queryKey: queryKey.proposal.ROOT });
};
