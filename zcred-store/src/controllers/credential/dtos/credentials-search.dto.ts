import { Type } from '@sinclair/typebox';

export const CredentialsSearchDto = Type.Union([
  Type.Object({
    'subject.id.key': Type.String(),
    'subject.id.type': Type.String(),
    'issuer.type': Type.String(),
    'issuer.uri': Type.String(),
  }, { additionalProperties: false }),
  Type.Object({}, { additionalProperties: false }),
]);
