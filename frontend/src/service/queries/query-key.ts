import type { CredentialsGetManySearchArgs } from '@/service/external/zcred-store/types/credentials-api.types.ts';
import type { VerificationStoreInitArgs } from '@/stores/verification-store/verification-store.ts';


export const queryKey = {
  // _private: () => [DidStore.$did.peek()!.id] as const,

  credential: {
    ROOT: ['credential'] as const,
    get: (credentialId: string) => [...queryKey.credential.ROOT, credentialId] as const,
  },

  credentials: {
    ROOT: ['credentials'] as const,
    get: (args?: CredentialsGetManySearchArgs) => [...queryKey.credentials.ROOT, args] as const,
  },

  zkpResult: {
    ROOT: ['zkpResult'] as const,
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
