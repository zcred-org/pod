import type { HttpIssuer, Info } from '@zcredjs/core';
import { queryClient } from '@/config/query-client.ts';
import type { Proposal } from '@/service/external/verifier/types.ts';
import { VerifierApi } from '@/service/external/verifier/verifier-api.ts';
import { zCredStore } from '@/service/external/zcred-store';
import type { VerificationStoreInitArgs } from '@/stores/verification-store/verification-store.ts';


/**
 * Caches the proposal from the URL if it's valid
 */
export async function proposalQueryEnsure(args: VerificationStoreInitArgs): Promise<Proposal> {
  return await queryClient.ensureQueryData({
    queryKey: ['proposal', args],
    queryFn: async () => await VerifierApi.proposalGet({
      proposalURL: args.proposalURL,
      secretData: await zCredStore.secretData.secretDataById(args.sdid),
    }),
    retry: 2, // 3 fetches total
    staleTime: 5 * 60e3, // 5 minutes. TODO: when verification session will expire?
  });
}

/**
 * Caches the issuer info
 */
export async function issuerInfoEnsure(httpIssuer: HttpIssuer): Promise<Info> {
  return queryClient.ensureQueryData({
    queryKey: ['httpIssuer.getInfo', httpIssuer.uri.href],
    queryFn: async () => await httpIssuer.getInfo().catch(e => {
      console.error('Failed to fetch issuer info:', e);
      throw e;
    }),
    retry: 2, // 3 fetches total
    staleTime: 5 * 60e3, // 5 minutes
  });
}
