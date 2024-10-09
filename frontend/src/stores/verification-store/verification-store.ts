import type { HttpIssuer, Info, Identifier, IssuerException } from '@zcredjs/core';
import { type IconStatusEnum } from '@/components/icons/IconStatus.tsx';
import type { ProvingResultUnsigned, ProvingResult, Proposal } from '@/service/external/verifier/types.ts';
import type { CredentialMarked } from '@/service/external/zcred-store/types/credentials.types.ts';
import type { O1JSCredentialFilter } from '@/service/o1js-credential-filter';
import { $isWalletAndDidConnected } from '@/stores/other.ts';
import { WalletStore } from '@/stores/wallet.store.ts';
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
    /** Subscriptions for computed(...) **/
    const isWalledAndDidConnected = $isWalletAndDidConnected.value;
    const credentials = VerificationStore.$credentialsAsync.value;
    /** Body **/
    return isWalledAndDidConnected && credentials.isSuccess && !credentials.data.at(0)?.isProvable;
  }, `${StoreName}.computed.isIssuanceRequired`);
  public static $holyCrapWhatsLoadingNow = computed(() => {
    return VerificationStore.$terminateAsync.value.isLoading
      ? { text: 'Terminating the verification...', value: HolyCrapWhatsLoadingNow.Terminate } as const
      : VerificationStore.$proofSendAsync.value.isLoading
        ? { text: 'Sending the proof...', value: HolyCrapWhatsLoadingNow.ProofSend } as const
        : VerificationStore.$proofCreateAsync.value.isLoading
          ? { text: 'Creating a proof...', value: HolyCrapWhatsLoadingNow.ProofCreate } as const
          : VerificationStore.$credentialsAsync.value.isLoading
            ? { text: 'Loading credentials...', value: HolyCrapWhatsLoadingNow.Credentials } as const
            : VerificationStore.$proofCacheAsync.value.isLoading
              ? { text: 'Searching for existing proofs...', value: HolyCrapWhatsLoadingNow.ProofCache } as const
              : null;
  }, `${StoreName}.computed.holyCrapWhatsLoadingNow`);
}

export type VerificationStoreInitArgs = {
  proposalURL: string,
}

export function verificationStoreInitArgsFrom(
  { proposalURL }: Partial<{ proposalURL: string }>,
): VerificationStoreInitArgs | undefined {
  return proposalURL ? { proposalURL: proposalURL } : undefined;
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

export enum HolyCrapWhatsLoadingNow {
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
