import { pgTable, text, serial, timestamp, integer, boolean, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const employersTable = pgTable("employers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  name: text("name").notNull(),
  ownerName: text("owner_name"),
  isGroup: boolean("is_group").notNull().default(false),
  branchCount: integer("branch_count"),
  governorate: text("governorate").notNull().default(""),
  city: text("city").notNull().default(""),
  address: text("address"),
  nearbyLandmark: text("nearby_landmark"),
  phone: text("phone"),
  whatsapp: text("whatsapp"),
  alternatePhone: text("alternate_phone"),
  mapsLink: text("maps_link"),
  lat: doublePrecision("lat"),
  lng: doublePrecision("lng"),
  logoUrl: text("logo_url"),
  description: text("description"),
  yearEstablished: integer("year_established"),
  profileCompletionPct: integer("profile_completion_pct").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertEmployerSchema = createInsertSchema(employersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertEmployer = z.infer<typeof insertEmployerSchema>;
export type Employer = typeof employersTable.$inferSelect;
