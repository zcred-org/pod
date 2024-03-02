import { type Static, Type } from '@sinclair/typebox';
import { IssuerDtoRef } from '../../../models/dtos/issuer.dto.js';
import { IdentifierDtoRef } from '../../../models/dtos/identifier.dto.js';

export type CredentialUpsertDto = Static<typeof CredentialUpsertDto>

export const CredentialUpsertDto = Type.Object({
  id: Type.Optional(Type.String({ format: 'uuid' })),
  data: Type.String(),
  issuer: IssuerDtoRef,
  subjectId: IdentifierDtoRef,
}, { $id: 'CredentialUpsertDto', additionalProperties: false });

export const CredentialUpsertDtoRef = Type.Ref(CredentialUpsertDto);
