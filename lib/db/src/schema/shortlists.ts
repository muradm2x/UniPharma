import { pgTable, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const shortlistsTable = pgTable("shortlists", {
  id: serial("id").primaryKey(),
  employerId: integer("employer_id").notNull(),
  candidateId: integer("candidate_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertShortlistSchema = createInsertSchema(shortlistsTable).omit({ id: true, createdAt: true });
export type InsertShortlist = z.infer<typeof insertShortlistSchema>;
export type Shortlist = typeof shortlistsTable.$inferSelect;
