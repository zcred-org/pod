import type { HttpIssuer, Info, Identifier, IssuerException } from '@zcredjs/core';
import { type IconStatusEnum } from '@/components/icons/IconStatus.tsx';
import type { ProvingResultUnsigned, ProvingResult, Proposal } from '@/service/external/verifier/types.ts';
import type { CredentialMarked } from '@/service/external/zcred-store/types/credentials.types.ts';
import type { O1JSCredentialFilter } from '@/service/o1js-credential-filter';
import { WalletStore } from '@/stores/wallet.store.ts';
import { ZCredSessionStore } from '@/stores/zcred-session.store.ts';
import { isSubjectIdsEqual } from '@/util';
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

  public static $credentialIssueAsync = signalAsync()({ name: `${StoreName}.async.credentialIssue` });

  public static $proofCacheAsync = signalAsync()({ name: `${StoreName}.async.proofCached` });
  public static $proofCreateAsync = signalAsync<ProvingResultUnsigned>()({
    staleDataOnLoading: true,
    name: `${StoreName}.async.proofCreate`,
  });
  public static $proofSignAsync = signalAsync<ProvingResult>()({ name: `${StoreName}.async.proofSign` });
  public static $proofSendAsync = signalAsync()({ name: `${StoreName}.async.proofSend` });

  public static $issuerError = signal<IssuerException | null>(null, `${StoreName}.state.issuerError`);
  public static $terminateAsync = signalAsync<null | VerificationTerminateOk | VerificationTerminateErr>()({ name: `${StoreName}.async.terminate` });

  public static $isSubjectMatch = computed<boolean>(() => isSubjectIdsEqual(
    VerificationStore.$initDataAsync.value?.data?.requiredId,
    WalletStore.$wallet.value?.subjectId,
  ), `${StoreName}.computed.isSubjectMatch`);
  public static $isIssuanceRequired = computed(() => {
    const credentials = VerificationStore.$credentialsAsync.value;
    return credentials.isSuccess && !credentials.data.at(0)?.isProvable;
  }, `${StoreName}.computed.isIssuanceRequired`);
  public static $holyCrapWhatsLoadingNow = computed(() => {
    return VerificationStore.$terminateAsync.value.isLoading
      ? { text: 'Terminating the verification...', stage: HolyCrapWhatsLoadingNowStageEnum.Terminate } as const
      : VerificationStore.$proofSendAsync.value.isLoading
        ? { text: 'Sending the proof...', stage: HolyCrapWhatsLoadingNowStageEnum.ProofSend } as const
        : VerificationStore.$proofCreateAsync.value.isLoading
          ? { text: 'Creating a proof...', stage: HolyCrapWhatsLoadingNowStageEnum.ProofCreate } as const
          : VerificationStore.$credentialsAsync.value.isLoading
            ? { text: 'Loading credentials...', stage: HolyCrapWhatsLoadingNowStageEnum.Credentials } as const
            : VerificationStore.$proofCacheAsync.value.isLoading
              ? { text: 'Searching for existing proofs...', stage: HolyCrapWhatsLoadingNowStageEnum.ProofCache } as const
              : null;
  }, `${StoreName}.computed.holyCrapWhatsLoadingNow`);
  public static $isNavigateBlocked = computed<boolean>(() => {
    const credentialIssueAsync = VerificationStore.$credentialIssueAsync.value;
    const terminateAsync = VerificationStore.$terminateAsync.value;
    const challenge = ZCredSessionStore.session.value?.challenge;

    const isNotTerminated = terminateAsync.isIdle || terminateAsync.isLoading;
    const isNoIssueRedirect = !(credentialIssueAsync.isLoading && !challenge);
    return isNotTerminated && isNoIssueRedirect;
  }, `${StoreName}.computed.isNavigateBlocked`);
}

export type VerificationStoreInitArgs = {
  proposalURL: string,
  zcredSessionId?: string,
}

export function verificationStoreInitArgsFrom(
  args: Partial<VerificationStoreInitArgs>,
): VerificationStoreInitArgs | undefined {
  return args.proposalURL ?
    { proposalURL: args.proposalURL, zcredSessionId: args.zcredSessionId }
    : undefined;
}

export type VerificationInitData = {
  initArgs: VerificationStoreInitArgs,
  proposal: Proposal,
  jalId: string,
  httpIssuer: HttpIssuer
  issuerInfo: Info | undefined,
  credentialFilter: O1JSCredentialFilter,
  requiredId: Identifier,
  issuerHost: string,
  verifierHost: string,
};

export enum HolyCrapWhatsLoadingNowStageEnum {
  Terminate = 'Terminate',
  ProofSend = 'ProofSend',
  ProofCreate = 'ProofCreate',
  Credentials = 'Credentials',
  ProofCache = 'ProofCache',
}

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
