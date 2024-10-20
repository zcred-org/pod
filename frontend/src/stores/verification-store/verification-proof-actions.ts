import { batch } from '@preact/signals-react';
import { AppGlobal } from '@/config/app-global.ts';
import { WebhookCallError } from '@/service/external/verifier/errors.ts';
import { zkpResultFrom } from '@/service/external/verifier/types.ts';
import { VerifierApi } from '@/service/external/verifier/verifier-api.ts';
import { zCredStore } from '@/service/external/zcred-store';
import { zCredProver } from '@/service/o1js-zcred-prover';
import { zkpResultQuery } from '@/service/queries/zkp-result-cache.query.ts';
import { VerificationStore } from '@/stores/verification-store/verification-store.ts';
import { VerificationTerminateActions } from '@/stores/verification-store/verification-terminate-actions.ts';
import { WalletStore } from '@/stores/wallet.store.ts';
import { go } from '@/util';


export class VerificationProofActions {
  public static async proofCreate(): Promise<void> {
    /** Read state **/
    const wallet = WalletStore.$wallet.peek();
    const credential = VerificationStore.$credential.peek();
    const initData = VerificationStore.$initDataAsync.peek().data;
    /** Perform checks **/
    if (!wallet || !initData || !credential) {
      const errors: string[] = [];
      if (!initData) errors.push('VerificationStore is not initialized');
      if (!wallet) errors.push('Wallet connection is required');
      if (!credential) errors.push('Credential is required for proof creation');
      throw new Error(`Proof creation failed: ${errors.join(', ')}`);
    }
    if (!credential.isProvable) throw new Error('Selected credential is not provable');
    /** Perform logic **/
    VerificationStore.$proofCreateAsync.loading();
    const [proof, error] = await go<Error>()(zCredProver.createProof({
      credential: credential.data,
      jalProgram: initData.proposal.program,
    }));
    if (proof) {
      VerificationStore.$proofCreateAsync.resolve(proof);
      zCredStore.zkpResultCache.save({
        zkpResult: zkpResultFrom(proof),
        jalId: initData.jalId,
      }).then();
    } else {
      VerificationStore.$proofCreateAsync.reject(error);
      throw error;
    }
  }

  public static async proofCacheLoad(): Promise<void> {
    const proofCacheState = VerificationStore.$proofCacheAsync.peek();
    if (proofCacheState.isLoading || proofCacheState.isSuccess) return;
    const initData = VerificationStore.$initDataAsync.peek().data;
    if (!initData) throw new Error('VerificationStore is not initialized');
    VerificationStore.$proofCacheAsync.loading();
    const [zkpResult, error] = await go<Error>()(zkpResultQuery.fetch(initData.jalId));
    if (!zkpResult) {
      if (error) VerificationStore.$proofCacheAsync.reject(error);
      else VerificationStore.$proofCacheAsync.reset();
      return;
    }
    if (await zCredProver.verifyZkProof({ jalProgram: initData.proposal.program, zkpResult })) {
      batch(() => {
        VerificationStore.$proofCacheAsync.resolve();
        VerificationStore.$proofCreateAsync.resolve(zkpResult);
      });
      console.log('ZkpResult used from cache');
    } else {
      VerificationStore.$proofCacheAsync.reset();
      console.error('Cached ZkpResult is invalid');
    }
  }

  public static async proofSign(): Promise<void> {
    /** Read state **/
    const wallet = WalletStore.$wallet.peek();
    const proposal = VerificationStore.$initDataAsync.peek().data?.proposal;
    const proofUnsigned = VerificationStore.$proofCreateAsync.peek().data;
    /** Perform checks **/
    if (!proofUnsigned || !wallet || !proposal) {
      const errors: string[] = [];
      if (!wallet) errors.push('Wallet is not connected');
      if (!proposal) errors.push('VerificationStore is not initialized');
      if (!proofUnsigned) errors.push('Proof is not created');
      throw new Error(`Can't sign proof: ${errors.join(', ')}`);
    }
    /** Perform logic **/
    VerificationStore.$proofSignAsync.loading();
    const [signature, error] = await go<Error>()(wallet.adapter.sign({ message: proposal.challenge.message }));
    if (signature) {
      VerificationStore.$proofSignAsync.resolve({ ...proofUnsigned, signature, message: proposal.challenge.message });
      VerificationProofActions.proofSend().then();
    } else {
      VerificationStore.$proofSignAsync.reject(error!);
    }
    if (error) throw error;
  }

  public static async proofSend(): Promise<void> {
    /** Read state **/
    const verifierURL = VerificationStore.$initDataAsync.peek().data?.proposal.verifierURL;
    const verifierHost = VerificationStore.$initDataAsync.peek().data?.verifierHost;
    const proof = VerificationStore.$proofSignAsync.peek().data;
    /** Perform checks **/
    if (!verifierURL || !verifierHost) throw new Error('VerificationStore is not initialized');
    if (!VerificationStore.$proofCreateAsync.peek().data) throw new Error('Proof is not created');
    if (!proof) throw new Error('Proof is not signed');
    /** Perform logic **/
    VerificationStore.$proofSendAsync.loading();
    const [res, error] = await go<Error>()(VerifierApi.proofSend({ verifierURL, proof }));
    if (!error) {
      await VerificationTerminateActions.resolve(res?.redirectURL);
      VerificationStore.$proofSendAsync.resolve();
    } else {
      VerificationStore.$proofSendAsync.reject(error);
      if (error instanceof WebhookCallError) {
        await VerificationTerminateActions.verificationFailed();
      } else {
        await AppGlobal.VerificationErrorActions.proofSendCatch({ error, verifierHost });
      }
      throw error;
    }
  }
}
