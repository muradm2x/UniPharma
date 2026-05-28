import { pgTable, text, serial, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const offerStatusEnum = pgEnum("offer_status", ["pending", "accepted", "rejected"]);

export const offersTable = pgTable("offers", {
  id: serial("id").primaryKey(),
  employerId: integer("employer_id").notNull(),
  candidateId: integer("candidate_id").notNull(),
  message: text("message").notNull(),
  status: offerStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertOfferSchema = createInsertSchema(offersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertOffer = z.infer<typeof insertOfferSchema>;
export type Offer = typeof offersTable.$inferSelect;
