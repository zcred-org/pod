import type { HttpCredential } from '@zcredjs/core';
import type { OverrideProperties } from 'type-fest';
import type { ZCredStore } from '@/service/external/zcred-store/api-specification.ts';


export type CredentialDecoded = OverrideProperties<
  ZCredStore['CredentialDto'],
  { data: HttpCredential }
>;

export type CredentialsDecodedDto = OverrideProperties<
  ZCredStore['CredentialsDto'],
  { credentials: CredentialDecoded[] }
>;

export type CredentialMarked = CredentialDecoded & { isProvable: boolean };
