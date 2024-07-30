import { type Static, Type } from '@sinclair/typebox';
import { CredentialDto } from './credential.dto.js';


export type CredentialIdDto = Static<typeof CredentialIdDto>

export const CredentialIdDto = Type.Pick(
  CredentialDto,
  ['id'],
  {
    $id: 'CredentialIdDto',
    description: 'Credential identifier',
    additionalProperties: false,
  },
);

export const CredentialIdDtoRef = Type.Ref(CredentialIdDto);
