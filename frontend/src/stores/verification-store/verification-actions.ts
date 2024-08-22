import type { AxiosError } from 'axios';
import { toast } from 'sonner';
import { CredentialValidIntervalModal } from '@/components/modals/CredentialValidIntervalModal.tsx';
import { VerifierApi } from '@/service/external/verifier/verifier-api.ts';
import { zCredStore } from '@/service/external/zcred-store';
import { zCredProver } from '@/service/o1js-zcred-prover';
import { credentialsInfiniteQuery } from '@/service/queries/credentials.query.ts';
import { VerificationCredentialsActions } from '@/stores/verification-store/verification-credentials-actions.ts';
import { VerificationErrorActions } from '@/stores/verification-store/verification-error-actions.tsx';
import { VerificationStore } from '@/stores/verification-store/verification-store.ts';
import { VerificationTerminateActions } from '@/stores/verification-store/verification-terminate-actions.ts';
import { WalletStore } from '@/stores/wallet.store.ts';
import { dateIntervalFieldsFrom, isDateIntervalMatched } from '@/types/date-interval.ts';
import { DetailedError, RejectedByUserError } from '@/util/errors.ts';
import { verifyCredentialJWS, go } from '@/util/helpers.ts';


export class VerificationActions {
  public static async credentialIssue(): Promise<void> {
    /** Read state **/
    const initData = VerificationStore.$initDataAsync.peek().data;
    const wallet = WalletStore.$wallet.peek();
    /** Perform checks **/
    if (!initData || !wallet) {
      const errors: string[] = [];
      if (!initData) errors.push('VerificationStore is not initialized');
      if (!wallet) errors.push('Wallet connection is required');
      throw new Error(`Credential upsert failed: ${errors.join(', ')}`);
    }
    const { credentialFilter, issuerInfo, httpIssuer, issuerHost } = initData;
    if (!issuerInfo) {
      await VerificationTerminateActions.rejectNoCredsAndNoIssuer(issuerHost);
      throw new Error('Issuer info is required for credential issuance');
    }
    /** Perform logic **/
    VerificationStore.$credentialIssueAsync.loading();
    try {
      const validInterval = await CredentialValidIntervalModal.open(dateIntervalFieldsFrom(issuerInfo)).catch(error => {
        if (error instanceof RejectedByUserError) toast.warning('You need to set the validity period to continue');
        throw error;
      });
      if (!isDateIntervalMatched(validInterval, dateIntervalFieldsFrom(issuerInfo))) {
        throw new Error('Valid interval does not match issuer info');
      }
      if (!httpIssuer.browserIssue) throw new Error('Issuer does not support credential issuance');
      const credentialNew = await httpIssuer.browserIssue({
        challengeReq: {
          subject: { id: wallet.subjectId },
          options: { chainId: wallet.chainId },
          validFrom: validInterval?.from?.toISOString(),
          validUntil: validInterval?.to?.toISOString(),
        },
        sign: wallet.adapter.sign,
        windowOptions: { target: '_blank' },
      }).catch(error => {
        VerificationErrorActions.credentialIssueCatch({ error, issuerHost });
        throw error;
      });
      // Verify JWS
      await verifyCredentialJWS(credentialNew, issuerInfo.protection.jws.kid).catch(error => {
        // TODO: Verification must be terminated?
        throw new DetailedError('Credential issuance failed', error);
      });
      // Store credential
      await zCredStore.credential.credentialUpsert(credentialNew);
      VerificationStore.$credentialIssueAsync.resolve();
      // // @ts-expect-error In DEV, we can break the credential
      // credentialNew.attributes.subject.firstName = 'FirstName123';
      const isProvable = credentialFilter.execute(credentialNew);
      if (!isProvable) {
        await VerificationTerminateActions.rejectAttributesNotMatch();
      } else {
        credentialsInfiniteQuery.invalidateROOT();
        VerificationCredentialsActions.$refetchNoWait();
      }
    } catch (error) {
      VerificationStore.$credentialIssueAsync.reject(error as Error);
      throw error;
    }
  }

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
    console.time('createProof');
    const [proof, error] = await go<Error>()(zCredProver.createProof({
      credential: credential.data,
      jalProgram: initData.proposal.program,
    }));
    console.timeEnd('createProof');
    if (proof) {
      VerificationStore.$proofCreateAsync.resolve(proof);
      VerificationActions.proofSign().then();
    } else {
      VerificationStore.$proofCreateAsync.reject(error);
      throw error;
    }
  }

  public static async proofSign(): Promise<void> {
    /** Read state **/
    const wallet = WalletStore.$wallet.peek();
    const proposal = VerificationStore.$initDataAsync.peek().data?.proposal;
    const proof = VerificationStore.$proofCreateAsync.peek().data;
    /** Perform checks **/
    if (!proof || !wallet || !proposal) {
      const errors: string[] = [];
      if (!wallet) errors.push('Wallet is not connected');
      if (!proposal) errors.push('VerificationStore is not initialized');
      if (!proof) errors.push('Proof is not created');
      throw new Error(`Can't sign proof: ${errors.join(', ')}`);
    }
    /** Perform logic **/
    VerificationStore.$proofSignAsync.loading();
    const [signature, error] = await go<Error>()(wallet.adapter.sign({ message: proposal.challenge.message }));
    if (signature) {
      VerificationStore.$proofSignAsync.resolve({ ...proof, signature });
      VerificationActions.proofSend().then();
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
    const [res, error] = await go<AxiosError>()(VerifierApi.proofSend({ verifierURL, proof }));
    if (!error) {
      await VerificationTerminateActions.resolve(res?.redirectURL);
      VerificationStore.$proofSendAsync.resolve();
    } else {
      VerificationStore.$proofSendAsync.reject(error);
      await VerificationErrorActions.proofSendCatch({ error, verifierHost });
      throw error;
    }
  }
}
