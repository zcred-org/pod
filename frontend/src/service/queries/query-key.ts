import type { CredentialsGetManySearchArgs } from '@/service/external/zcred-store/types/credentials-api.types.ts';
import { DidStore } from '@/stores/did-store/did.store.ts';
import type { VerificationStoreInitArgs } from '@/stores/verification-store/verification-store.ts';


export const queryKey = {
  get PRIVATE() { return [DidStore.$did.value?.id] as const; },

  credential: {
    get ROOT() { return ['credential', ...queryKey.PRIVATE] as const; },
    get: (credentialId: string) => [...queryKey.credential.ROOT, credentialId] as const,
  },

  credentials: {
    get ROOT() { return ['credentials', ...queryKey.PRIVATE] as const; },
    get: (args?: CredentialsGetManySearchArgs) => [...queryKey.credentials.ROOT, args] as const,
  },

  zkpResult: {
    get ROOT() { return ['zkpResult', ...queryKey.PRIVATE] as const; },
    get: (jalId: string) => [...queryKey.zkpResult.ROOT, jalId] as const,
  },

  proposal: {
    ROOT: ['proposal'] as const,
    get: (args: VerificationStoreInitArgs) => [...queryKey.proposal.ROOT, args] as const,
  },

  issuer: {
    ROOT: ['issuerInfo'] as const,
    CURRENT: (httpIssuerHref: string) => [...queryKey.issuer.ROOT, httpIssuerHref] as const,
    info: (httpIssuerHref: string) => [...queryKey.issuer.CURRENT(httpIssuerHref), 'info'] as const,
  },
};

export type CredentialQueryKey = ReturnType<typeof queryKey['credential']['get']>;
export type CredentialsQueryKey = ReturnType<typeof queryKey['credentials']['get']>;
export type ZkpResultQueryKey = ReturnType<typeof queryKey['zkpResult']['get']>;
export type ProposalQueryKey = ReturnType<typeof queryKey['proposal']['get']>;
export type IssuerInfoQueryKey = ReturnType<typeof queryKey['issuer']['info']>;
