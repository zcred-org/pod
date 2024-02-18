import { char, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const CredentialEntity = pgTable('credential', {
  id: uuid('id').defaultRandom().primaryKey(),
  controlledBy: char('controlled_by', { length: 56 }).notNull(),
  data: text('data').notNull(),
  issuer: text('issuer').notNull(),
  subjectId: text('subject_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type CredentialEntity = typeof CredentialEntity.$inferSelect;
export type CredentialEntityNew = typeof CredentialEntity.$inferInsert;
