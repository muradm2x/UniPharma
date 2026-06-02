import {
  pgTable,
  text,
  serial,
  timestamp,
  integer,
  boolean,
  doublePrecision,
  pgEnum,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["candidate", "employer", "admin"]);
export const jobStatusEnum = pgEnum("job_status", ["active", "closed", "filled"]);
export const applicationStatusEnum = pgEnum("application_status", ["pending", "reviewing", "accepted", "rejected"]);
export const offerStatusEnum = pgEnum("offer_status", ["pending", "accepted", "rejected"]);
export const targetRoleEnum = pgEnum("target_role", ["candidate", "employer"]);

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").unique(),
  passwordHash: text("password_hash"),
  googleId: text("google_id").unique(),
  phone: text("phone").unique(),
  role: roleEnum("role").notNull().default("candidate"),
  fullName: text("full_name").notNull(),
  profilePicture: text("profile_picture"),
  phoneVerified: boolean("phone_verified").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

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
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

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
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

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
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const applicationsTable = pgTable("applications", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").notNull(),
  candidateId: integer("candidate_id").notNull(),
  coverLetter: text("cover_letter"),
  status: applicationStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const offersTable = pgTable("offers", {
  id: serial("id").primaryKey(),
  employerId: integer("employer_id").notNull(),
  candidateId: integer("candidate_id").notNull(),
  message: text("message").notNull(),
  status: offerStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const notificationsTable = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  link: text("link"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const packagesTable = pgTable("packages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameAr: text("name_ar").notNull(),
  targetRole: targetRoleEnum("target_role").notNull(),
  priceUsd: doublePrecision("price_usd").notNull().default(0),
  dailyLimit: integer("daily_limit").notNull(),
  monthlyLimit: integer("monthly_limit").notNull(),
  features: text("features"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const userSubscriptionsTable = pgTable("user_subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  packageId: integer("package_id").notNull(),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull().defaultNow(),
  endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const shortlistsTable = pgTable("shortlists", {
  id: serial("id").primaryKey(),
  employerId: integer("employer_id").notNull(),
  candidateId: integer("candidate_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
