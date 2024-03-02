import type { Identifier } from '../models/dtos/identifier.dto.js';
import type { IssuerDto } from '../models/dtos/issuer.dto.js';

/**
 *  Project root directory
 *  before build: <project_path>/src
 *  after build: <project_path>/dist
 */
export const ROOT_DIR = new URL('../', import.meta.url);

export const subjectIdConcat = (subjectId: Identifier) => `${subjectId.type}:${subjectId.key}`;

export const issuerConcat = (issuer: IssuerDto) => `${issuer.type}:${issuer.uri}`;
