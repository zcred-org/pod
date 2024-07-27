import { batch } from '@preact/signals-react';
import { HttpIssuer, type IssuerException } from '@zcredjs/core';
import { queryClient } from '@/config/query-client.ts';
import { O1JSCredentialFilter } from '@/service/o1js-credential-filter';
import { proposalQueryEnsure, issuerInfoEnsure } from '@/service/queries.ts';
import { type VerificationStoreInitArgs, VerificationStore } from '@/stores/verification-store/verification-store.ts';
import { VerificationTerminateActions } from '@/stores/verification-store/verification-terminate-actions.ts';

export abstract class VerificationInitActions {
  public static async init(initArgs: VerificationStoreInitArgs): Promise<void> {
    try {
      VerificationStore.$initDataAsync.loading();
      const proposal = await proposalQueryEnsure(initArgs).catch((error: IssuerException) => {
        VerificationTerminateActions.reject({
          ui: { message: `Verifier (${new URL(initArgs.proposalURL).host}) is not working` },
          isSkipVerifierReq: true,
        });
        throw error;
      });
      const httpIssuer = new HttpIssuer(
        proposal.selector.meta.issuer.uri,
        proposal.accessToken ? `Bearer ${proposal.accessToken}` : undefined,
      );
      const [issuerInfo, credentialFilter] = await Promise.all([
        issuerInfoEnsure(httpIssuer).catch(() => undefined),
        O1JSCredentialFilter.create(proposal.program),
      ]);
      VerificationStore.$initDataAsync.resolve({
        initArgs,
        proposal,
        httpIssuer,
        issuerInfo,
        credentialFilter,
        issuerHost: new URL(proposal.selector.meta.issuer.uri).host,
        verifierHost: new URL(proposal.verifierURL).host,
        requiredId: proposal.selector.attributes.subject.id,
      });
    } catch (error) {
      VerificationStore.$initDataAsync.reject(error as Error);
      throw error;
    }
  }

  static async restart() {
    const initArgs = VerificationStore.$initDataAsync.peek().data?.initArgs;
    if (!initArgs) throw new Error('VerificationStore is not initialized');
    batch(() => {
      VerificationStore.$credentialUpsertAsync.reset();
      VerificationStore.$credentialUpdateProofsError.value = null;
      VerificationStore.$proofCreateAsync.reset();
      VerificationStore.$proofSignAsync.reset();
      VerificationStore.$proofSendAsync.reset();
      VerificationStore.$terminateAsync.reset();
    });
    await queryClient.invalidateQueries({ queryKey: ['proposal'] });
    await VerificationInitActions.init(initArgs);
  }
}
