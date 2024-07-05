// noinspection JSUnusedLocalSymbols

import { batch, effect } from '@preact/signals-react';
import type { Identifier } from '@zcredjs/core';
import axios, { type AxiosError } from 'axios';
import { toast } from 'sonner';
import type { SetOptional } from 'type-fest';
import { CredentialValidIntervalModal } from '@/components/modals/CredentialValidIntervalModal.tsx';
import { credentialIssueOrUpdatePure } from '@/routes/prove/-utils/credential-issue-or-update-pure.ts';
import { credentialsFetchPure } from '@/routes/prove/-utils/credentials-fetch-pure.ts';
import { type ProofStorePrepareData, proofStorePreparePure } from '@/routes/prove/-utils/proof-store-prepare-pure.ts';
import type { ProvingResult } from '@/service/external/verifier/types.ts';
import { zCredStore } from '@/service/external/zcred-store';
import { zCredProver } from '@/service/o1js-zcred-prover';
import type { ProposalQueryArgs } from '@/service/queries.ts';
import { $isWalletAndDidConnected } from '@/stores/other.ts';
import { WalletStore } from '@/stores/wallet.store.ts';
import type { CredentialMarked } from '@/types/credentials-marked.ts';
import { dateIntervalFieldsFrom } from '@/types/date-interval.ts';
import { DetailedError, RejectedByUserError } from '@/util/errors.ts';
import { isSubjectIdsEqual, verifyCredentialJWS } from '@/util/helpers.ts';
import { signalAsync } from '@/util/signals/signal-async.ts';
import { signal, computed } from '@/util/signals/signals-dev-tools.ts';

const StoreName = 'ProofStore';

export class ProofStore {
  public static $challengeInitData = signal<ProofStorePrepareData | null>(null, `${StoreName}.state.challengeInitData`);

  public static $credentialsAsync = signalAsync<CredentialMarked[]>()({
    initData: [],
    staleDataOnLoading: true,
    name: `${StoreName}.async.credentials`,
  });
  public static $credential = signal<CredentialMarked | null>(null, `${StoreName}.state.credential`);

  public static $credentialUpsertAsync = signalAsync()({ name: `${StoreName}.async.credentialUpsert` });

  public static $proofCreateAsync = signalAsync<SetOptional<ProvingResult, 'signature'>>()({
    staleDataOnLoading: true,
    name: `${StoreName}.async.proof`,
  });
  public static $proofSignAsync = signalAsync()({ name: `${StoreName}.async.proofSigning` });
  public static $proofSendAsync = signalAsync()({ name: `${StoreName}.async.proofSend` });

  public static $cantContinueReason = signal<string | null>(null, `${StoreName}.state.cantContinueReason`);

  private static SUBs: {
    credentialsRefetchEffect?: (() => void);
  } = {};

  private static subscriptionsEnable() {
    ProofStore.SUBs.credentialsRefetchEffect ??= effect(() => {
      /** TODO: fix subscriptions duplication. Subscriptions of credentialsRefetch: **/
      ProofStore.$challengeInitData.value;
      ProofStore.$isSubjectMatch.value;
      $isWalletAndDidConnected.value;
      /** Function body **/
      ProofStore.credentialsRefetch().then();
    });
  }

  // private static subscriptionsDisable() {
  //   ProofStore.SUBs.credentialsRefetchEffect?.();
  //   ProofStore.SUBs = {};
  // }

  public static async proveStorePrepare(args: ProposalQueryArgs) {
    ProofStore.subscriptionsEnable();
    try {
      ProofStore.$challengeInitData.value = await proofStorePreparePure(args);
    } catch (error) {
      ProofStore.$challengeInitData.value = null;
      throw error;
    }
  }

  private static async credentialsRefetch() {
    /** Subscriptions for effect(credentialsRefetch) **/
    const initData = ProofStore.$challengeInitData.value;
    const isSubjectMatch = ProofStore.$isSubjectMatch.value;
    const isWalletAndDidConnected = $isWalletAndDidConnected.value;
    /** Function body **/
    if (!isSubjectMatch || !initData || !isWalletAndDidConnected) {
      return batch(() => {
        ProofStore.$credentialsAsync.reset();
        ProofStore.$credential.value = null;
      });
    }
    ProofStore.$credentialsAsync.loading();
    const [rez, error] = await credentialsFetchPure({
      credentialFilter: initData.credentialFilter,
      issuerInfo: initData.issuerInfo,
      credentialSelectedId: ProofStore.$credential.peek()?.id,
      filter: {
        subject: initData.proposal.selector.attributes.subject.id,
        issuer: initData.proposal.selector.meta.issuer,
      },
    })
      .then((rez) => [rez, undefined] as const)
      .catch((error: Error) => [undefined, error] as const);
    batch(() => {
      if (rez) ProofStore.$credentialsAsync.resolve(rez.credentials);
      else ProofStore.$credentialsAsync.reject(error);
      if (rez?.isAutoSelectFirst) {
        ProofStore.$credential.value = rez?.credentials.at(0) ?? null;
      } else if (rez?.isSelectedNotFound || error) {
        ProofStore.$credential.value = null;
      }
      if (!ProofStore.$cantContinueReason.peek()
        && rez?.credentials.at(0)?.isProvable === false
        && !initData.issuerInfo
      ) {
        ProofStore.$cantContinueReason.value = 'You haven\'t suitable credential and issuer can\'t issue new now.\nPlease, check back later.';
      }
    });
    if (error) throw error;
  }

  private static async credentialUpsert() {
    const initData = ProofStore.$challengeInitData.peek();
    const credentialSelected = ProofStore.$credential.peek();
    const wallet = WalletStore.$wallet.peek();

    if (!initData || !wallet) {
      const errors: string[] = [];
      if (!initData) errors.push('ProofProcess is not initialized');
      if (!wallet) errors.push('Wallet connection is required');
      throw new Error(`Credential upsert failed: ${errors.join(', ')}`);
    }
    if (!initData.issuerInfo) {
      ProofStore.$cantContinueReason.value = 'You haven\'t suitable credential and issuer can\'t issue new now.\nPlease, check back later.';
      throw new Error('Issuer unavailable');
    }
    const { credentialFilter, issuerInfo, httpIssuer } = initData;
    ProofStore.$credentialUpsertAsync.loading();
    try {
      const validInterval = await CredentialValidIntervalModal.open(
        dateIntervalFieldsFrom(initData.issuerInfo),
      ).catch(error => {
        if (error instanceof RejectedByUserError) toast.warning('You need to set the validity period to continue');
        throw error;
      });
      const credentialNew = await credentialIssueOrUpdatePure({
        credential: credentialSelected ?? undefined,
        credentialFilter,
        issuerInfo,
        validInterval,
        httpIssuer,
        wallet,
      });
      // Verify JWS
      await verifyCredentialJWS(credentialNew, issuerInfo.protection.jws.kid).catch(error => {
        throw new DetailedError('Credential issuance failed', error);
      });
      // Store credential
      // // @ts-expect-error In DEV, we can break the credential
      // credentialNew.attributes.subject.firstName = 'Ivan 123';
      const isProvable = credentialFilter.execute(credentialNew);
      if (!isProvable) {
        ProofStore.$cantContinueReason.value = 'Your attributes will not allow authentication';
      }
      await zCredStore.credential.credentialUpsert(credentialNew, credentialSelected?.id);
      ProofStore.$credentialUpsertAsync.resolve();
      ProofStore.credentialsRefetch().then();
    } catch (error) {
      ProofStore.$credentialUpsertAsync.reject(error as Error);
      throw error;
    }
  }

  public static async proofCreate() {
    const wallet = WalletStore.$wallet.peek();
    const credential = ProofStore.$credential.peek();
    const initData = ProofStore.$challengeInitData.peek();

    if (!wallet || !initData || !credential) {
      const errors: string[] = [];
      if (!initData) errors.push('ProofProcess is not initialized');
      if (!wallet) errors.push('Wallet connection is required');
      if (!credential) errors.push('Credential is required for proof creation');
      throw new Error(`Proof creation failed: ${errors.join(', ')}`);
    }

    if (credential.isUpdatable) {
      throw new Error('Update credential before creating proof');
    }
    if (!credential.isProvable) {
      throw new Error('Selected credential is not provable');
    }

    ProofStore.$proofCreateAsync.loading();
    console.time('createProof');
    const [proof, error] = await zCredProver.createProof({
      credential: credential.data,
      jalProgram: initData.proposal.program,
    })
      .then(proof2 => [proof2, undefined] as const)
      .catch((error: Error) => [undefined, new DetailedError('Proof creation failed', error)] as const);
    console.timeEnd('createProof');
    if (proof) {
      ProofStore.$proofCreateAsync.resolve(proof);
      ProofStore.proofSign().then();
    } else {
      ProofStore.$proofCreateAsync.reject(error);
      throw error;
    }
  }

  public static async proofSign() {
    const wallet = WalletStore.$wallet.peek();
    const proposal = ProofStore.$challengeInitData.peek()?.proposal;
    const proof = ProofStore.$proofCreateAsync.peek().data;

    if (!proof || !wallet || !proposal) {
      const errors: string[] = [];
      if (!proof) errors.push('Proof is required for signing the challenge');
      if (!wallet) errors.push('Wallet connection is required');
      if (!proposal) errors.push('ProofProcess is not initialized');
      throw new Error(`Challenge signing failed: ${errors.join(', ')}`);
    }

    ProofStore.$proofSignAsync.loading();
    const [signature, error] = await wallet.adapter.sign({ message: proposal.challenge.message })
      .then(signature => [signature, undefined] as const)
      .catch((error) => [undefined, new DetailedError('Challenge signing failed', error)] as const);
    batch(() => {
      if (signature) {
        ProofStore.$proofCreateAsync.resolve({ ...proof, signature });
        ProofStore.$proofSignAsync.resolve();
        ProofStore.proofSend().then();
      } else {
        ProofStore.$proofSignAsync.reject(error!);
      }
    });
    if (error) throw error;
  }

  public static async proofSend() {
    /** Read state **/
    const proposal = ProofStore.$challengeInitData.peek()?.proposal;
    const proof = ProofStore.$proofCreateAsync.peek().data;
    /** Perform checks **/
    if (!proposal) throw new Error('ProofStore is not initialized');
    if (!proof) throw new Error('Proof is not created');
    if (!proof.signature) throw new Error('Proof is not signed');
    /** Perform logic **/
    ProofStore.$proofSendAsync.loading();
    const [response, error] = await axios.post<{ redirectURL: string }>(proposal.verifierURL, proof)
      .then(res => [res, undefined] as const)
      .catch((error: AxiosError) => [undefined, error] as const);
    if (response) {
      ProofStore.$proofSendAsync.resolve();
      toast.success('Challenge completed! Redirecting...', { duration: 3e3 });
      await new Promise(resolve => setTimeout(resolve, 3e3));
      location.replace(response.data.redirectURL);
    } else {
      ProofStore.$proofSendAsync.reject(error);
      toast.error('Failed to send proof');
      throw error;
    }
  }

  public static $requiredId = computed<Identifier | null>(() => ProofStore.$challengeInitData.value?.proposal.selector.attributes.subject.id ?? null, `${StoreName}.computed.requiredId`);
  public static $isSubjectMatch = computed<boolean>(() => isSubjectIdsEqual(WalletStore.$wallet.value?.subjectId, ProofStore.$requiredId.value), `${StoreName}.computed.isSubjectMatch`);
  public static $credentialUpsert = computed(() => {
    /** Subscriptions for computed(...) **/
    const isWalledAndDidConnected = $isWalletAndDidConnected.value;
    const credential = ProofStore.$credential.value;
    const credentials = ProofStore.$credentialsAsync.value;
    /** Body **/
    const canUpsert: boolean = credentials.isSuccess && isWalledAndDidConnected;
    const isIssue = canUpsert && !credentials.data.at(0)?.isProvable;
    const isUpdate = canUpsert && !!credential?.isUpdatable;
    const title = isIssue ? 'Issue Credential'
      : isUpdate ? 'Update Credential'
        : undefined;
    return title ? {
      isIssue, isUpdate, title,
      fn: ProofStore.credentialUpsert,
    } : null;
  }, `${StoreName}.computed.credentialUpsert`);
  public static $proposalComment = computed<string | null>(() => {
    return ProofStore.$challengeInitData.value?.proposal.comment ?? null;
  }, `${StoreName}.computed.proposalComment`);
  public static $verifierHost = computed<string | null>(() => {
    return ProofStore.$challengeInitData.value && new URL(ProofStore.$challengeInitData.value.proposal.verifierURL).host;
  }, `${StoreName}.computed.verifierHost`);
  public static $issuerHost = computed<string | null>(() => {
    return ProofStore.$challengeInitData.value && new URL(ProofStore.$challengeInitData.value.proposal.selector.meta.issuer.uri).host;
  }, `${StoreName}.computed.issuerHost`);
}
