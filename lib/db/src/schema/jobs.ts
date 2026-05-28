import { pgTable, text, serial, timestamp, integer, boolean, doublePrecision, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const jobStatusEnum = pgEnum("job_status", ["active", "closed", "filled"]);

export const jobsTable = pgTable("jobs", {
  id: serial("id").primaryKey(),
  employerId: integer("employer_id").notNull(),
  title: text("title").notNull(),
  specialization: text("specialization").notNull(),
  description: text("description"),
  governorate: text("governorate").notNull(),
  city: text("city").notNull(),
  jobType: text("job_type").notNull(),
  shift: text("shift"),
  salaryMin: integer("salary_min"),
  salaryMax: integer("salary_max"),
  isEmergency: boolean("is_emergency").notNull().default(false),
  status: jobStatusEnum("status").notNull().default("active"),
  lat: doublePrecision("lat"),
  lng: doublePrecision("lng"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertJobSchema = createInsertSchema(jobsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertJob = z.infer<typeof insertJobSchema>;
export type Job = typeof jobsTable.$inferSelect;
