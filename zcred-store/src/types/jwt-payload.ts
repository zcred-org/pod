export interface JwtPayloadCrete {
  /** Nonce of authorization */
  nonce: string;
  /** did:key */
  did: string;
  /** Unix timestamp in seconds */
  exp: number;
}

export interface JwtPayload extends JwtPayloadCrete {
  /** Unix timestamp in seconds */
  iat: number;
}
