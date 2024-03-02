import { Static, Type } from '@sinclair/typebox';

export interface JwtPayloadCrete {
  /** Nonce of authorization */
  nonce: string;
  /** did:key */
  did: string;
}

export type JwtPayloadDto = Static<typeof JwtPayloadDto>;

export const JwtPayloadDto = Type.Object({
  nonce: Type.String(),
  did: Type.String(),
  /** Unix timestamp in seconds */
  exp: Type.Number(),
  /** Unix timestamp in seconds */
  iat: Type.Number(),
}, { $id: 'JwtPayloadDto' });
