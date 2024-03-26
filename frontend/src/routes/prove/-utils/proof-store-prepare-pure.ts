import { HttpIssuer } from '@zcredjs/core';
import { O1JSCredentialFilter } from '@/service/o1js-credential-filter';
import { ensureIssuerInfo, ensureProposalQuery } from '@/service/queries.ts';
import { checkProposalValidity } from '@/util/helpers.ts';

export type ProofStorePrepareData = Awaited<ReturnType<typeof proofStorePreparePure>>;

export async function proofStorePreparePure(proposalURL: string) {
  const proposal = await ensureProposalQuery(proposalURL);
  checkProposalValidity(proposal);
  const httpIssuer = new HttpIssuer(
    proposal.selector.meta.issuer.uri,
    proposal.accessToken ? `Bearer ${proposal.accessToken}` : undefined,
  );
  const [issuerInfo, credentialFilter] = await Promise.all([
    ensureIssuerInfo(httpIssuer).catch((e) => {
      console.error('Failed to fetch issuer info', e);
      return undefined;
    }),
    O1JSCredentialFilter.create(proposal.program),
  ]);
  return { proposalURL, proposal, httpIssuer, issuerInfo, credentialFilter };
}
