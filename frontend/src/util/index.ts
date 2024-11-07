import type { HttpCredential } from '@zcredjs/core';
import { omit } from 'lodash-es';
import sortKeys from 'sort-keys';
import * as u8a from 'uint8arrays';
import type { Proposal } from '@/service/external/verifier/types.ts';
import { didPublic } from '@/util/did-public.ts';
import { base64UrlDecode } from '@/util/independent/base64.ts';


export function codeToURL(code: string): string {
  const decodedProgram = u8a.toString(u8a.fromString(code), 'base64');
  return `data:application/javascript;base64,${decodedProgram}`;
}

export function toJWTPayload(obj: object): string {
  return u8a.toString(u8a.fromString(JSON.stringify(obj)), 'base64url');
}

export const verifyCredentialJWS = async (credential: HttpCredential, issuerKid: string) => {
  const { 0: jwsHeader, 2: jwsSignature } = credential.protection.jws.split('.');
  if ((JSON.parse(base64UrlDecode(jwsHeader || '')) as Record<string, string>).kid !== issuerKid) {
    throw new Error('JWS kid does not match');
  }
  const jwsPayload = toJWTPayload(sortKeys(omit(credential, ['protection']), { deep: true }));
  await didPublic.verifyJWS(`${jwsHeader}.${jwsPayload}.${jwsSignature}`);
};

export const checkProposalValidity = (proposal: Proposal): boolean => {
  const [, recipientDomain] = /recipient url: (.*?)(?=\n)/i.exec(proposal?.challenge.message ?? '') ?? [null, null];
  return !!recipientDomain && proposal.verifierURL.startsWith(recipientDomain);
};
