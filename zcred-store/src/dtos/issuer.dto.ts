import { type Static, Type } from '@sinclair/typebox';

export type IssuerDto = Static<typeof IssuerDto>

export const IssuerDto = Type.Object({
  type: Type.String(),
  uri: Type.String({ format: 'uri' }),
}, { $id: 'IssuerDto' });

export const IssuerDtoRef = Type.Ref(IssuerDto);
