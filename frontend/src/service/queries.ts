import type { HttpIssuer, Info } from '@zcredjs/core';
import axios from 'axios';
import { queryClient } from '@/config/query-client.ts';
import type { Proposal } from '@/service/external/verifier/types.ts';


/**
 * Caches the proposal from the URL if it's valid
 * @param proposalURL Decoded proposal URL
 * @returns Proposal
 */
export async function ensureProposalQuery(proposalURL: string): Promise<Proposal> {
  return queryClient.ensureQueryData({
    queryKey: ['proposal', proposalURL],
    queryFn: async () => await axios.get<Proposal>(proposalURL).then(res => res.data),
  });
}

/**
 * Caches the issuer info
 * @param httpIssuer HttpIssuer
 * @returns Info
 */
export async function ensureIssuerInfo(httpIssuer: HttpIssuer): Promise<Info> {
  return queryClient.ensureQueryData({
    queryKey: ['httpIssuer.getInfo', httpIssuer.uri.href],
    queryFn: async () => await httpIssuer.getInfo(),
  });
}
