import { type Static, Type } from '@sinclair/typebox';
import { CredentialEntity } from '../../../models/entities/credential.entity.js';


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

export function credentialDtoFrom(
  credential: Pick<CredentialEntity, 'id' | 'data' | 'updatedAt' | 'createdAt'>,
): CredentialDto {
  return {
    id: credential.id,
    data: credential.data,
    updatedAt: credential.updatedAt.toISOString(),
    createdAt: credential.createdAt.toISOString(),
  };
}
