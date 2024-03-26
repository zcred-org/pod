import type { CredentialsApi } from '@/service/external/zcred-store/credentials.api.ts';

export type CredentialsSearchInput = Required<Parameters<CredentialsApi['credentials']>[0]>
