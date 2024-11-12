import { batch, effect } from '@preact/signals-react';
import { HttpIssuer, IssuerException, VerifierException } from '@zcredjs/core';
import type { AxiosError } from 'axios';
import { credentialsGetManySearchArgsFrom } from '@/service/external/zcred-store/types/credentials-api.types.ts';
import { O1JSCredentialFilter } from '@/service/o1js-credential-filter';
import { O1JSZCredProver } from '@/service/o1js-zcred-prover';
import { credentialsInfiniteQuery } from '@/service/queries/credentials.query.ts';
import { issuerInfoQuery } from '@/service/queries/issuer-info.query.ts';
import { proposalQuery } from '@/service/queries/proposal.query.ts';
import { zkpResultQuery } from '@/service/queries/zkp-result-cache.query.ts';
import { VerificationCredentialsActions } from '@/stores/verification-store/verification-credentials-actions.ts';
import { VerificationProofActions } from '@/stores/verification-store/verification-proof-actions.ts';
import { type VerificationStoreInitArgs, VerificationStore } from '@/stores/verification-store/verification-store.ts';
import { VerificationTerminateActions } from '@/stores/verification-store/verification-terminate-actions.ts';
import { jalIdFrom } from '@/util/jal-id-from.ts';


export abstract class VerificationInitActions {
  static #SUBs: {
    credentialsInfiniteQueryEffect?: VoidFunction;
    credentialsRefetchEffect?: VoidFunction;
    proofCacheFetchEffect?: VoidFunction;
  } = {};

  static subscriptionsEnable(): void {
    VerificationInitActions.#SUBs.credentialsInfiniteQueryEffect ??= effect(() => {
      const proposal = VerificationStore.$initDataAsync.value.data?.proposal;
      if (!proposal) return;
      return credentialsInfiniteQuery.signalSub(credentialsGetManySearchArgsFrom(proposal));
    });
    VerificationInitActions.#SUBs.credentialsRefetchEffect ??= effect(VerificationCredentialsActions.$refetchNoWait);
    VerificationInitActions.#SUBs.proofCacheFetchEffect ??= effect(() => {
      /** Subscriptions **/
      const credentialsAsync = VerificationStore.$credentialsAsync.value;
      /** Logic **/
      const proofCache = VerificationStore.$proofCacheAsync.peek();
      if (proofCache.isSuccess) {
        VerificationInitActions.#SUBs.proofCacheFetchEffect?.();
        delete VerificationInitActions.#SUBs.proofCacheFetchEffect;
        return;
      }
      if (!proofCache.isLoading && credentialsAsync.isSuccess && credentialsAsync.data.at(0)?.isProvable) {
        VerificationProofActions.proofCacheLoad().then();
      }
    });
  }

  static subscriptionsDisable() {
    Object.values(VerificationInitActions.#SUBs).forEach((sub) => sub?.());
    VerificationInitActions.#SUBs = {};
  }

  public static async init(initArgs: VerificationStoreInitArgs): Promise<void> {
    const status = VerificationStore.$initDataAsync.peek();
    if (status.isLoading || status.isSuccess) return;
    try {
      VerificationStore.$initDataAsync.loading();
      const proposal = await proposalQuery.fetch(initArgs.proposalURL).catch(async (error: VerifierException | AxiosError) => {
        if (error instanceof VerifierException) await VerificationTerminateActions.reject({
          ui: { message: `Verifier (${new URL(initArgs.proposalURL).host}) is not working` },
          isSkipVerifierReq: true,
        }); else if (error.response?.status === 404) await VerificationTerminateActions.rejectNoSecretData();
        // TODO: Need to handle zCredStore exceptions
        throw error;
      });
      const httpIssuer = new HttpIssuer(
        proposal.selector.meta.issuer.uri,
        proposal.accessToken ? `Bearer ${proposal.accessToken}` : undefined,
      );
      const [issuerInfo, credentialFilter, jalId] = await Promise.all([
        issuerInfoQuery.fetch(httpIssuer).catch((err: IssuerException) => err),
        O1JSCredentialFilter.create(proposal.program),
        jalIdFrom(proposal.program),
      ]);
      VerificationStore.$initDataAsync.resolve({
        initArgs,
        proposal,
        jalId,
        httpIssuer,
        issuerInfo: issuerInfo instanceof Error ? undefined : issuerInfo,
        credentialFilter,
        issuerHost: new URL(proposal.selector.meta.issuer.uri).host,
        verifierHost: new URL(proposal.verifierURL).host,
        requiredId: proposal.selector.attributes.subject.id,
        zCredProver: O1JSZCredProver.instance,
      });
      VerificationStore.$issuerError.value = issuerInfo instanceof IssuerException ? issuerInfo : null;
    } catch (error) {
      VerificationStore.$initDataAsync.reject(error as Error);
      throw error;
    }
  }

  static async restart() {
    const initArgs = VerificationStore.$initDataAsync.peek().data?.initArgs;
    if (!initArgs) throw new Error('VerificationStore is not initialized');
    batch(() => {
      VerificationStore.$initDataAsync.reset();
      VerificationStore.$credentialsAsync.reset();
      VerificationStore.$credential.value = null;
      VerificationStore.$credentialIssueAsync.reset();
      VerificationStore.$proofCacheAsync.reset();
      VerificationStore.$proofCreateAsync.reset();
      VerificationStore.$proofSignAsync.reset();
      VerificationStore.$proofSendAsync.reset();
      VerificationStore.$issuerError.value = null;
      VerificationStore.$terminateAsync.reset();
    });
    await Promise.all([
      proposalQuery.invalidateROOT(),
      issuerInfoQuery.invalidateROOT(),
      credentialsInfiniteQuery.resetROOT(),
      zkpResultQuery.invalidateROOT(),
    ]);
    VerificationInitActions.subscriptionsDisable();
    await VerificationInitActions.init({ proposalURL: initArgs.proposalURL });
    VerificationInitActions.subscriptionsEnable();
  }
}
