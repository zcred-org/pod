import { pgTable, text, varchar } from "drizzle-orm/pg-core";

export const ProgramEntity = pgTable("program", {
  id: varchar("id", { length: 52 }).primaryKey(),
  target: varchar("target", { length: 64 }).notNull(),
  data: text("data").notNull()
});

export type ProgramEntity = typeof ProgramEntity.$inferSelect;