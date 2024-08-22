import { Type, type Static } from '@sinclair/typebox';


export type CredentialsSearchParamsDto = Static<typeof CredentialsSearchParamsDto>

export const CredentialsSearchParamsDto = Type.Object({
  'subject.id.key': Type.Optional(Type.String()),
  'subject.id.type': Type.Optional(Type.String()),
  'issuer.type': Type.Optional(Type.String()),
  'issuer.uri': Type.Optional(Type.String({ format: 'uri' })),
  'offset': Type.Optional(Type.Number()),
  'limit': Type.Optional(Type.Number()),
}, {
  $id: 'CredentialsSearchParamsDto',
  additionalProperties: false,
});

export const CredentialsSearchParamsDtoRef = Type.Ref(CredentialsSearchParamsDto);
