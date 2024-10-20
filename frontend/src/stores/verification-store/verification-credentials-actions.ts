import { batch } from '@preact/signals-react';
import type { Info, HttpCredential } from '@zcredjs/core';
import { peek } from 'deepsignal/react';
import { zCredStore } from '@/service/external/zcred-store';
import { credentialsGetManySearchArgsFrom } from '@/service/external/zcred-store/types/credentials-api.types.ts';
import type { CredentialMarked } from '@/service/external/zcred-store/types/credentials.types.ts';
import { credentialsInfiniteQuery } from '@/service/queries/credentials.query.ts';
import { $isWalletAndDidConnected } from '@/stores/other.ts';
import { VerificationStore, type VerificationInitData } from '@/stores/verification-store/verification-store.ts';
import { VerificationTerminateActions } from '@/stores/verification-store/verification-terminate-actions.ts';
import { ZCredSessionStore } from '@/stores/zcred-session.store.ts';


export abstract class VerificationCredentialsActions {
  public static $refetchNoWait(offsetMin?: number) {
    /** Subscriptions **/
    credentialsInfiniteQuery.$signal.$data?.value;
    /** Read state **/
    const isChallenge = !!ZCredSessionStore.session.value?.challenge;
    const initData = VerificationStore.$initDataAsync.value.data;
    const isSubjectMatch = VerificationStore.$isSubjectMatch.value;
    const isWalletAndDidConnected = $isWalletAndDidConnected.value;
    /** Perform checks **/
    if (isChallenge || !isSubjectMatch || !initData || !isWalletAndDidConnected) {
      return batch(() => {
        VerificationStore.$credentialsAsync.reset();
        VerificationStore.$credential.value = null;
      });
    }
    /** Perform logic **/
    VerificationCredentialsActions.#refetchAsync({ initData, offsetMin }).then();
  }

  static async #refetchAsync(
    { initData, offsetMin = 0 }: { initData: VerificationInitData, offsetMin?: number },
  ) {
    if (VerificationStore.$credentialsAsync.peek().isLoading) return;
    VerificationStore.$credentialsAsync.loading();

    try {
      const credentials: CredentialMarked[] = [];
      let provableCount = 0;
      await credentialsInfiniteQuery.prefetch(credentialsGetManySearchArgsFrom(initData.proposal));
      const $query = credentialsInfiniteQuery.$signal;
      if ($query.isError) throw $query.error;
      const limit = $query.data!.pageParams.at(0)!.limit; // non-null because of prefetch

      const isCredentialUpdatable = VerificationCredentialsActions.#createUpdateChecker(initData.issuerInfo);
      const calcIsContinue = ({ pageIdx, offset }: Record<'offset' | 'pageIdx', number>): boolean => {
        const isFirstPage = pageIdx === 0;
        const hasNextPage = $query.hasNextPage;
        const isCurrentPageInCache = !!$query.data?.pages.at(pageIdx);
        const isOffsetMinNotReached = offset <= offsetMin;
        const isNoOneProvable = !provableCount;
        return Boolean(isFirstPage || isCurrentPageInCache || hasNextPage && (isOffsetMinNotReached || isNoOneProvable));
      };

      for (let offset = 0, pageIdx = 0; calcIsContinue({ offset, pageIdx }); offset += limit, ++pageIdx) {
        if (!$query.data?.pages.at(pageIdx)) await $query.fetchNextPage?.();
        if (!$query.data) throw new Error('CredentialsActions.refetch: No data');
        // Avoid signals deep-proxy using peek(), otherwise the proof web-worker cannot receive credentials!
        const page = peek($query.data.pages, pageIdx);
        if (!page) throw new Error(`CredentialsActions.refetch: No page idx=${pageIdx}`);
        const credentialsUpdated = await Promise.all(page.credentials.map(async credential => {
          // Update credential
          if (isCredentialUpdatable(credential.data)) {
            await initData?.httpIssuer.updateProofs?.(credential.data).catch(() => undefined).then(async credUpdated => {
              if (!credUpdated) return;
              credential = await zCredStore.credential.credentialUpsert(credUpdated, credential.id);
            });
          }
          // Mark credential
          const credentialMarked: CredentialMarked = {
            ...credential,
            isProvable: initData.credentialFilter.isCanProve(credential.data),
          };
          // Count if provable
          if (credentialMarked.isProvable) ++provableCount;
          // Return
          return credentialMarked;
        }));
        credentials.push(...credentialsUpdated);
      }

      VerificationCredentialsActions.#credentialSort(credentials);
      batch(() => {
        VerificationStore.$credentialsAsync.resolve(credentials);
        if (provableCount) { // Auto-select first item
          VerificationStore.$credential.value = credentials.at(0) || null;
        } else { // Deselect if (selected not found in store) or (not provable)
          const credentialSelected = VerificationStore.$credential.peek();
          const credentialSelectedStored = credentialSelected && credentials.find(({ id }) => id === credentialSelected?.id);
          if (credentialSelectedStored?.isProvable !== true)
            VerificationStore.$credential.value = null;
        }
      });
      if (credentials.at(0)?.isProvable === false
        && !initData.issuerInfo
        && VerificationStore.$terminateAsync.peek().isIdle
      ) // Terminate if no provable credentials and no issuer
        await VerificationTerminateActions.rejectNoCredsAndNoIssuer(initData.issuerHost);
    } catch (error) {
      console.error(`${VerificationCredentialsActions.#refetchAsync.name} error:`, {
        error,
        type: typeof error,
        constructor: error!.constructor.name,
        message: error instanceof Error ? error.message : undefined,
      });
      batch(() => {
        VerificationStore.$credentialsAsync.reject(error as Error);
        VerificationStore.$credential.value = null;
      });
    }
  }

  static #createUpdateChecker(issuerInfo: Info | undefined) {
    return (credential: HttpCredential): boolean => {
      return !!issuerInfo?.proofs.updatable && issuerInfo.proofs.updatedAt > credential.attributes.issuanceDate;
    };
  }

  static #credentialSort(credentials: CredentialMarked[]) {
    return credentials.sort((left, right) => {
      // Provable are first
      return Number(right.isProvable) - Number(left.isProvable)
        // else if provable equals then latest-issued are first
        || new Date(right.data.attributes.issuanceDate).getTime() - new Date(left.data.attributes.issuanceDate).getTime();
    });
  }
}
