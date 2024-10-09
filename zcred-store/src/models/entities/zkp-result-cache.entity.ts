import { char, pgTable, text, timestamp, uuid, index } from 'drizzle-orm/pg-core';


export const ZkpResultCacheEntity = pgTable('zkp_result_cache', {
  id: uuid('id').defaultRandom().primaryKey(),
  jalId: char('jal_id', { length: 64 }).notNull(),
  data: text('data').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
}, table => ({
  searchIdx: index('zkp_result_cache__search_idx').on(table.jalId, table.createdAt.desc()),
}));

export type ZkpResultCacheEntity = typeof ZkpResultCacheEntity.$inferSelect;
export type ZkpResultCacheEntityNew = typeof ZkpResultCacheEntity.$inferInsert;
