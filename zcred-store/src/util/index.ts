import type { Identifier } from '../models/dtos/identifier.dto.js';
import type { IssuerDto } from '../models/dtos/issuer.dto.js';
import { Ed25519Provider } from 'key-did-provider-ed25519';
import { DID } from 'dids';
import { getResolver } from 'key-did-resolver';
import crypto from 'node:crypto';

/**
 *  Project root directory
 *  before build: <project_path>/src
 *  after build: <project_path>/dist
 */
export const ROOT_DIR = new URL('../', import.meta.url);

export async function didFromSeed(seed: string) {
  const hash = crypto.createHash('sha256');
  hash.update(seed);
  const did = new DID({
    provider: new Ed25519Provider(new Uint8Array(hash.digest())),
    resolver: getResolver(),
  });
  await did.authenticate();
  return did;
}

export const subjectIdConcat = (subjectId: Identifier) => `${subjectId.type}:${subjectId.key}`;

export const issuerConcat = (issuer: IssuerDto) => `${issuer.type}:${issuer.uri}`;
