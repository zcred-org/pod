import { type Static, Type } from '@sinclair/typebox';

export type Identifier = Static<typeof IdentifierDto>;

export const IdentifierDto = Type.Object({
  type: Type.String(),
  key: Type.String(),
}, { $id: 'IdentifierDto' });

export const IdentifierDtoRef = Type.Ref(IdentifierDto);
