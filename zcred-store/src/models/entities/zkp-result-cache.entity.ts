import { char, pgTable, text, timestamp, uuid, unique } from 'drizzle-orm/pg-core';


export const ZkpResultCacheEntity = pgTable('zkp_result_cache', {
  id: uuid('id').defaultRandom().primaryKey(),
  controlledBy: char('controlled_by', { length: 56 }).notNull(),
  jalId: char('jal_id', { length: 64 }).notNull(),
  data: text('data').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
}, t => ({
  uniqByUser: unique('zkp_result_cache__uniq_by_user').on(t.controlledBy, t.jalId),
}));

export type ZkpResultCacheEntity = typeof ZkpResultCacheEntity.$inferSelect;
export type ZkpResultCacheEntityNew = typeof ZkpResultCacheEntity.$inferInsert;
