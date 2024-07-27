import type { HttpIssuer, Info, Identifier, JsonZcredException } from '@zcredjs/core';
import { type IconStatusEnum } from '@/components/icons/IconStatus.tsx';
import type { ProvingResultUnsigned, ProvingResult, Proposal } from '@/service/external/verifier/types.ts';
import type { O1JSCredentialFilter } from '@/service/o1js-credential-filter';
import { $isWalletAndDidConnected } from '@/stores/other.ts';
import { WalletStore } from '@/stores/wallet.store.ts';
import type { CredentialMarked } from '@/types/credentials-marked.ts';
import { isSubjectIdsEqual } from '@/util/helpers.ts';
import { signalAsync } from '@/util/signals/signal-async.ts';
import { signal, computed } from '@/util/signals/signals-dev-tools.ts';


const StoreName = 'VerificationStore';

export class VerificationStore {
  public static $initDataAsync = signalAsync<VerificationInitData>()({ name: `${StoreName}.async.initData` });

  public static $credentialsAsync = signalAsync<CredentialMarked[]>()({
    initData: [],
    staleDataOnLoading: true,
    name: `${StoreName}.async.credentials`,
  });
  public static $credential = signal<CredentialMarked | null>(null, `${StoreName}.state.credential`);

  public static $credentialUpsertAsync = signalAsync()({ name: `${StoreName}.async.credentialUpsert` });

  public static $proofCreateAsync = signalAsync<ProvingResultUnsigned>()({
    staleDataOnLoading: true,
    name: `${StoreName}.async.proofCreate`,
  });
  public static $proofSignAsync = signalAsync<ProvingResult>()({ name: `${StoreName}.async.proofSign` });
  public static $proofSendAsync = signalAsync()({ name: `${StoreName}.async.proofSend` });

  public static $credentialUpdateProofsError = signal<JsonZcredException | null>(null, `${StoreName}.state.credentialUpdateProofsError`);
  public static $terminateAsync = signalAsync<null | VerificationTerminateOk | VerificationTerminateErr>()({ name: `${StoreName}.async.terminate` });

  public static $isSubjectMatch = computed<boolean>(() => isSubjectIdsEqual(
    VerificationStore.$initDataAsync.value?.data?.requiredId,
    WalletStore.$wallet.value?.subjectId,
  ), `${StoreName}.computed.isSubjectMatch`);
  public static $credentialUpsertInfo = computed(() => {
    /** Subscriptions for computed(...) **/
    const isWalledAndDidConnected = $isWalletAndDidConnected.value;
    const credential = VerificationStore.$credential.value;
    const credentials = VerificationStore.$credentialsAsync.value;
    const updateProofsError = VerificationStore.$credentialUpdateProofsError.value;
    /** Body **/
    const canUpsert: boolean = credentials.isSuccess && isWalledAndDidConnected;
    const isIssue = canUpsert && !credentials.data.at(0)?.isProvable;
    const isUpdate = canUpsert && !updateProofsError && !!credential?.isUpdatable;
    return isIssue || isUpdate ? { isIssue, isUpdate } : null;
  }, `${StoreName}.computed.credentialUpsertInfo`);
  public static $holyCrapWhatsLoadingNow = computed<string | null>(() => {
    return VerificationStore.$proofCreateAsync.value.isLoading ? 'Creating a proof...'
      : VerificationStore.$proofSendAsync.value.isLoading ? 'Sending the created proof...'
        : VerificationStore.$terminateAsync.value.isLoading ? 'Terminating the verification...'
          : null;
  });
}

export type VerificationStoreInitArgs = {
  proposalURL: string,
  sdid: string,
}

type VerificationInitData = {
  initArgs: VerificationStoreInitArgs,
  proposal: Proposal,
  httpIssuer: HttpIssuer
  issuerInfo: Info | undefined,
  credentialFilter: O1JSCredentialFilter,
  requiredId: Identifier,
  issuerHost: string,
  verifierHost: string,
};

type VerificationTerminateOk = {
  ui: {
    status: IconStatusEnum.Ok,
    redirectURL?: string,
  }
}

export type VerificationTerminateErr = {
  ui: {
    status: IconStatusEnum.Warn | IconStatusEnum.Error,
    message: string,
    redirectURL?: string,
  },
};
