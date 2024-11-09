import type { CredentialsGetManySearchArgs } from '@/service/external/zcred-store/types/credentials-api.types.ts';
import { DidStore } from '@/stores/did-store/did.store.ts';


export const queryKey = {
  get PRIVATE() { return [DidStore.$did.value?.id] as const; },

  credential: {
    ROOT: ['credential'] as const,
    get PRIVATE() { return [...queryKey.credential.ROOT, ...queryKey.PRIVATE] as const; },
    get: (credentialId: string) => [...queryKey.credential.PRIVATE, { credentialId }] as const,
  },

  credentials: {
    ROOT: ['credentials'] as const,
    get PRIVATE() { return [...queryKey.credentials.ROOT, ...queryKey.PRIVATE] as const; },
    get: (args?: CredentialsGetManySearchArgs) => [...queryKey.credentials.PRIVATE, args] as const,
  },

  zkpResult: {
    ROOT: ['zkpResult'] as const,
    get PRIVATE() { return [...queryKey.zkpResult.ROOT, ...queryKey.PRIVATE] as const; },
    get: (jalId: string) => [...queryKey.zkpResult.PRIVATE, { jalId }] as const,
  },

  proposal: {
    ROOT: ['proposal'] as const,
    get: (proposalURL: string) => [...queryKey.proposal.ROOT, { proposalURL }] as const,
  },

  issuer: {
    ROOT: ['httpIssuer'] as const,
    CURRENT: (httpIssuerHref: string) => [...queryKey.issuer.ROOT, httpIssuerHref] as const,
    info: (httpIssuerHref: string) => [...queryKey.issuer.CURRENT(httpIssuerHref), 'info'] as const,
  },
};

export type CredentialQueryKey = ReturnType<typeof queryKey['credential']['get']>;
export type CredentialsQueryKey = ReturnType<typeof queryKey['credentials']['get']>;
export type ZkpResultQueryKey = ReturnType<typeof queryKey['zkpResult']['get']>;
export type ProposalQueryKey = ReturnType<typeof queryKey['proposal']['get']>;
export type IssuerInfoQueryKey = ReturnType<typeof queryKey['issuer']['info']>;
