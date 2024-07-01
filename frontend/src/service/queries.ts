import type { HttpIssuer, Info } from '@zcredjs/core';
import axios from 'axios';
import { queryClient } from '@/config/query-client.ts';
import type { Proposal } from '@/service/external/verifier/types.ts';
import { zCredStore } from '@/service/external/zcred-store';


export type ProposalQueryArgs = { proposalURL: string, sdid: string };

/**
 * Caches the proposal from the URL if it's valid
 */
export async function ensureProposalQuery(args: ProposalQueryArgs): Promise<Proposal> {
  return queryClient.ensureQueryData({
    queryKey: ['proposal', args],
    queryFn: async () => {
      const secretData = await zCredStore.secretData.secretDataById(args.sdid);
      return await axios.post<Proposal>(args.proposalURL, secretData).then(res => res.data);
    },
  });
}

/**
 * Caches the issuer info
 */
export async function ensureIssuerInfo(httpIssuer: HttpIssuer): Promise<Info> {
  return queryClient.ensureQueryData({
    queryKey: ['httpIssuer.getInfo', httpIssuer.uri.href],
    queryFn: async () => await httpIssuer.getInfo(),
  });
}
