import { type Info, IEC, type Challenge } from '@zcredjs/core';
import { toast } from 'sonner';
import { CredentialValidIntervalModal } from '@/components/modals/CredentialValidIntervalModal.tsx';
import { zCredStore } from '@/service/external/zcred-store';
import { credentialsInfiniteQuery } from '@/service/queries/credentials.query.ts';
import { DidStore } from '@/stores/did.store.ts';
import { VerificationCredentialsActions } from '@/stores/verification-store/verification-credentials-actions.ts';
import { VerificationStore } from '@/stores/verification-store/verification-store.ts';
import { VerificationTerminateActions } from '@/stores/verification-store/verification-terminate-actions.ts';
import { WalletStore } from '@/stores/wallet.store.ts';
import { ZCredSessionStore } from '@/stores/zcred-session.store.ts';
import { dateIntervalFieldsFrom, isDateIntervalMatched } from '@/types/date-interval.ts';
import { verifyCredentialJWS } from '@/util';
import { RejectedByUserError, DetailedError } from '@/util/errors.ts';
import { VerificationErrorActions } from '@/stores/verification-store/verification-error-actions.tsx';


export class VerificationIssueActions {
  public static async start(): Promise<void> {
    /** Read state **/
    const initData = VerificationStore.$initDataAsync.peek().data;
    const wallet = WalletStore.$wallet.peek();
    const didPrivateKey = DidStore.seed;
    const didKey = DidStore.$did.peek()?.id;
    /** Perform checks **/
    if (!initData || !initData.issuerInfo || !wallet || !didPrivateKey || !didKey) {
      const errors: string[] = [];
      if (!initData) errors.push('VerificationStore is not initialized');
      else if (!initData.issuerInfo) {
        VerificationTerminateActions.rejectNoCredsAndNoIssuer(initData.issuerHost).then();
        throw new Error('Issuer info is required for credential issuance');
      }
      if (!wallet) errors.push('Wallet connection is required');
      if (!didKey || !didPrivateKey) errors.push('DID is required');
      throw new Error(`Credential upsert failed: ${errors.join(', ')}`);
    }
    const { issuerInfo, httpIssuer, initArgs } = initData;
    /** Perform logic **/
    VerificationStore.$credentialIssueAsync.loading();
    try {
      const validInterval = await VerificationIssueActions.#getValidInterval(issuerInfo);
      const zcredSessionId = window.crypto.randomUUID();
      if (!httpIssuer.browserIssue) throw new Error('Issuer does not support credential issuance');
      const challenge = await httpIssuer.getChallenge({
        subject: { id: wallet.subjectId },
        validFrom: validInterval?.from?.toISOString(),
        validUntil: validInterval?.to?.toISOString(),
        options: {
          chainId: wallet.chainId,
          redirectURL: new URL(
            appRouter.buildLocation({ to: '/', search: { ...initArgs, zcredSessionId } }).href,
            window.location.origin,
          ).href,
        },
      });
      if (challenge.verifyURL) {
        ZCredSessionStore.set(zcredSessionId, { subjectId: wallet.subjectId, didPrivateKey, didKey, challenge });
        window.location.replace(challenge.verifyURL);
      } else {
        await VerificationIssueActions.finish(challenge);
      }
    } catch (err) {
      VerificationStore.$credentialIssueAsync.reject(err as Error);
      throw err;
    }
  }

  static async #getValidInterval(issuerInfo: Info) {
    const requiredFields = dateIntervalFieldsFrom(issuerInfo);
    return await CredentialValidIntervalModal
      .open(requiredFields)
      .then(validInterval => {
        if (!isDateIntervalMatched(validInterval, requiredFields))
          throw new Error('Valid interval does not match issuer info');
        return validInterval;
      })
      .catch(error => {
        if (error instanceof RejectedByUserError) toast.warning('You need to set the validity period to continue');
        throw error;
      });
  }

  public static async finish(challenge: Challenge): Promise<void> {
    /** Read state **/
    const initData = VerificationStore.$initDataAsync.peek().data;
    const wallet = WalletStore.$wallet.peek();
    /** Perform checks **/
    if (!initData || !initData.issuerInfo || !wallet || !challenge) {
      const errors: string[] = [];
      if (!initData) errors.push('VerificationStore is not initialized');
      else if (!initData.issuerInfo) {
        VerificationTerminateActions.rejectNoCredsAndNoIssuer(initData.issuerHost).then();
        throw new Error('Issuer info is required for credential issuance');
      }
      if (!wallet) errors.push('Wallet connection is required');
      if (!challenge) errors.push('Challenge is required');
      throw new Error(`Credential upsert failed: ${errors.join(', ')}`);
    }
    const { issuerInfo, httpIssuer, credentialFilter, issuerHost } = initData;
    /** Perform logic **/
    VerificationStore.$credentialIssueAsync.loading();
    try {
      const { canIssue } = await httpIssuer.canIssue({ sessionId: challenge.sessionId }).catch(err=>{
        VerificationErrorActions.credentialIssueCatch({ error: err, issuerHost });
        throw err;
      });
      if (!canIssue) {
        ZCredSessionStore.cleanup();
        VerificationStore.$credentialIssueAsync.reject(new Error(`Issuer can't issue credential`));
        return void await VerificationTerminateActions.reject({
          ui: { message: 'Verification not passed' },
          error: { code: IEC.ISSUE_DENIED },
        });
      }
      const signature = await wallet.adapter.sign({ message: challenge.message });
      const credential = await httpIssuer.issue({ sessionId: challenge.sessionId, signature }).catch(err=>{
        VerificationErrorActions.credentialIssueCatch({ error: err, issuerHost });
        throw err;
      });
      // Verify JWS
      await verifyCredentialJWS(credential, issuerInfo.protection.jws.kid).catch(error => {
        // TODO: Verification must be terminated?
        ZCredSessionStore.cleanup();
        throw new DetailedError('Credential issuance failed', error);
      });
      // Store credential
      await zCredStore.credential.credentialUpsert(credential);
      VerificationStore.$credentialIssueAsync.resolve();
      ZCredSessionStore.cleanup();
      // // @ts-expect-error In DEV, we can break the credential
      // credentialNew.attributes.subject.firstName = 'FirstName123';
      const isProvable = credentialFilter.execute(credential);
      if (!isProvable) {
        await VerificationTerminateActions.rejectAttributesNotMatch();
      } else {
        credentialsInfiniteQuery.invalidateROOT();
        VerificationCredentialsActions.$refetchNoWait();
      }
    } catch (err) {
      VerificationStore.$credentialIssueAsync.reject(err as Error);
      throw err;
    }
  }
}
