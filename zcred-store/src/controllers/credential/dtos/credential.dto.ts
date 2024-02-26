import { type Static, Type } from '@sinclair/typebox';

export type CredentialDto = Static<typeof CredentialDto>

export const CredentialDto = Type.Object({
  id: Type.String({ format: 'uuid' }),
  data: Type.String(),
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' }),
}, {
  $id: 'CredentialDto',
  description: 'Encrypted credential',
  additionalProperties: false,
});

export const CredentialDtoRef = Type.Ref(CredentialDto);
