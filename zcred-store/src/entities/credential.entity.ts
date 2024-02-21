import { char, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { issuerParse, subjectIdParse } from '../util/index.js';
import { IssuerSchema } from '../types/subject-id.type.js';
import { IdentifierSchema } from '../types/identifier.type.js';

export const CredentialEntity = pgTable('credential', {
  id: uuid('id').defaultRandom().primaryKey(),
  /** did:key generated from user signature */
  controlledBy: char('controlled_by', { length: 56 }).notNull(),
  /** JWE string of encrypted zk-credential by did:key (controlledBy) */
  data: text('data').notNull(),
  /** String "<zk-credential.meta.issuer.type>:<zk-credential.meta.issuer.uri>" */
  issuer: text('issuer').notNull(),
  /** String "<zk-credential.attributes.subject.id.type>:<zk-credential.attributes.subject.id.key>" */
  subjectId: text('subject_id').notNull(),
  /** Date of creation of zk-credential */
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  /** Date of last update of zk-credential */
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type CredentialEntity = typeof CredentialEntity.$inferSelect;
export type CredentialEntityNew = typeof CredentialEntity.$inferInsert;

export const CredentialEntityParsedSchema = {
  type: 'object',
  required: ['id', 'controlledBy', 'data', 'issuer', 'subjectId', 'createdAt', 'updatedAt'],
  properties: {
    id: { type: 'string', format: 'uuid' },
    controlledBy: { type: 'string', format: 'did:key' },
    data: { type: 'string' },
    issuer: IssuerSchema,
    subjectId: IdentifierSchema,
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
} as const;

export const credentialEntityParse = (credential: Partial<CredentialEntity>) => ({
  id: credential.id,
  controlledBy: credential.controlledBy,
  data: credential.data,
  issuer: credential.issuer ? issuerParse(credential.issuer) : credential.issuer,
  subjectId: credential.subjectId ? subjectIdParse(credential.subjectId) : credential.subjectId,
  createdAt: credential.createdAt?.toISOString(),
  updatedAt: credential.updatedAt?.toISOString(),
});
