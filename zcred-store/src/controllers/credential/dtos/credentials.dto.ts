import { Type, type Static } from '@sinclair/typebox';
import { CredentialDto } from './credential.dto.js';


export type CredentialsDto = Static<typeof CredentialsDto>;

export const CredentialsDto = Type.Object({
  credentials: Type.Array(CredentialDto),
  countTotal: Type.Number({ minimum: 0 }),
}, {
  $id: 'CredentialsDto',
  description: 'List of paginated credentials with total count',
  additionalProperties: false,
});

export const CredentialsDtoRef = Type.Ref(CredentialsDto);
