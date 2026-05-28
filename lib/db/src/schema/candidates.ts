import { pgTable, text, serial, timestamp, integer, boolean, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const candidatesTable = pgTable("candidates", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  whatsapp: text("whatsapp"),
  dateOfBirth: text("date_of_birth"),
  gender: text("gender"),
  governorate: text("governorate").notNull().default(""),
  city: text("city").notNull().default(""),
  address: text("address"),
  university: text("university"),
  faculty: text("faculty"),
  graduationYear: integer("graduation_year"),
  grade: text("grade"),
  specialization: text("specialization").notNull().default(""),
  yearsExperience: integer("years_experience").notNull().default(0),
  previousWorkplaces: text("previous_workplaces"),
  pharmacySkills: text("pharmacy_skills"),
  computerSkills: text("computer_skills"),
  communicationSkills: text("communication_skills"),
  certifications: text("certifications"),
  courses: text("courses"),
  availableForWork: boolean("available_for_work").notNull().default(false),
  preferredShift: text("preferred_shift"),
  jobType: text("job_type"),
  maxDistanceKm: integer("max_distance_km"),
  profilePicture: text("profile_picture"),
  personalSummary: text("personal_summary"),
  cvUrl: text("cv_url"),
  lat: doublePrecision("lat"),
  lng: doublePrecision("lng"),
  profileCompletionPct: integer("profile_completion_pct").notNull().default(0),
  isVerified: boolean("is_verified").notNull().default(false),
  verificationBadge: text("verification_badge"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertCandidateSchema = createInsertSchema(candidatesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCandidate = z.infer<typeof insertCandidateSchema>;
export type Candidate = typeof candidatesTable.$inferSelect;
