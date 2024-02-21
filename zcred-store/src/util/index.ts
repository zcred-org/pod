import type { Identifier } from '../types/identifier.type.js';
import type { Issuer } from '../types/subject-id.type.js';

/**
 *  Project root directory
 *  before build: <project_path>/src
 *  after build: <project_path>/dist
 */
export const ROOT_DIR = new URL('../', import.meta.url);

export const subjectIdConcat = (subjectId: Identifier) => `${subjectId.type}:${subjectId.key}`;

export const subjectIdParse = (subjectId: string): Identifier => {
  const colonLastIndex = subjectId.lastIndexOf(':');
  const type = subjectId.slice(0, colonLastIndex) as Identifier['type'];
  const key = subjectId.slice(colonLastIndex + 1) as Identifier['key'];
  return { type, key };
};

export const issuerConcat = (issuer: Issuer) => `${issuer.type}:${issuer.uri}`;

export const issuerParse = (issuer: string): Issuer => {
  const colonFirstIndex = issuer.indexOf(':');
  const type = issuer.slice(0, colonFirstIndex) as Issuer['type'];
  const uri = issuer.slice(colonFirstIndex + 1) as Issuer['uri'];
  return { type, uri };
};
