import { char, index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

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
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  /** Date of last update of zk-credential */
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, table => ({
  controlledByIdx: index('controlled_by_idx').on(table.controlledBy),
  searchIdx: index('search_idx').on(table.controlledBy, table.subjectId, table.issuer),
}));

export type CredentialEntity = typeof CredentialEntity.$inferSelect;
export type CredentialEntityNew = typeof CredentialEntity.$inferInsert;
