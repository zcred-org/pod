import { Type, type Static } from '@sinclair/typebox';
import { IdentifierDtoRef } from '../../../models/dtos/identifier.dto.js';

export type SecretDataDto = Static<typeof SecretDataDto>

export const SecretDataDto = Type.Intersect([
  Type.Object({
    subject: Type.Intersect([
      Type.Object({ id: IdentifierDtoRef }),
      Type.Record(Type.String(), Type.Any()),
    ]),
    clientSession: Type.String(),
    redirectURL: Type.String({ format: 'uri' }),
    issuerAccessToken: Type.Optional(Type.String()),
  }),
  Type.Record(Type.String(), Type.Any()),
], {
  $id: 'SecretDataDto',
  description: 'Secret verification data. Can include additional properties.',
});

export const SecretDataDtoRef = Type.Ref(SecretDataDto);
