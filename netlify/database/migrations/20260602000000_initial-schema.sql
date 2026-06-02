-- UniPharma database schema

CREATE TYPE "role" AS ENUM ('candidate', 'employer', 'admin');
CREATE TYPE "job_status" AS ENUM ('active', 'closed', 'filled');
CREATE TYPE "application_status" AS ENUM ('pending', 'reviewing', 'accepted', 'rejected');
CREATE TYPE "offer_status" AS ENUM ('pending', 'accepted', 'rejected');
CREATE TYPE "target_role" AS ENUM ('candidate', 'employer');

CREATE TABLE "users" (
  "id" SERIAL PRIMARY KEY,
  "email" TEXT UNIQUE,
  "password_hash" TEXT,
  "google_id" TEXT UNIQUE,
  "phone" TEXT UNIQUE,
  "role" "role" NOT NULL DEFAULT 'candidate',
  "full_name" TEXT NOT NULL,
  "profile_picture" TEXT,
  "phone_verified" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE "candidates" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL UNIQUE,
  "full_name" TEXT NOT NULL,
  "phone" TEXT,
  "whatsapp" TEXT,
  "date_of_birth" TEXT,
  "gender" TEXT,
  "governorate" TEXT NOT NULL DEFAULT '',
  "city" TEXT NOT NULL DEFAULT '',
  "address" TEXT,
  "university" TEXT,
  "faculty" TEXT,
  "graduation_year" INTEGER,
  "grade" TEXT,
  "specialization" TEXT NOT NULL DEFAULT '',
  "years_experience" INTEGER NOT NULL DEFAULT 0,
  "previous_workplaces" TEXT,
  "pharmacy_skills" TEXT,
  "computer_skills" TEXT,
  "communication_skills" TEXT,
  "certifications" TEXT,
  "courses" TEXT,
  "available_for_work" BOOLEAN NOT NULL DEFAULT false,
  "preferred_shift" TEXT,
  "job_type" TEXT,
  "max_distance_km" INTEGER,
  "profile_picture" TEXT,
  "personal_summary" TEXT,
  "cv_url" TEXT,
  "lat" DOUBLE PRECISION,
  "lng" DOUBLE PRECISION,
  "profile_completion_pct" INTEGER NOT NULL DEFAULT 0,
  "is_verified" BOOLEAN NOT NULL DEFAULT false,
  "verification_badge" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE "employers" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "owner_name" TEXT,
  "is_group" BOOLEAN NOT NULL DEFAULT false,
  "branch_count" INTEGER,
  "governorate" TEXT NOT NULL DEFAULT '',
  "city" TEXT NOT NULL DEFAULT '',
  "address" TEXT,
  "nearby_landmark" TEXT,
  "phone" TEXT,
  "whatsapp" TEXT,
  "alternate_phone" TEXT,
  "maps_link" TEXT,
  "lat" DOUBLE PRECISION,
  "lng" DOUBLE PRECISION,
  "logo_url" TEXT,
  "description" TEXT,
  "year_established" INTEGER,
  "profile_completion_pct" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE "jobs" (
  "id" SERIAL PRIMARY KEY,
  "employer_id" INTEGER NOT NULL,
  "title" TEXT NOT NULL,
  "specialization" TEXT NOT NULL,
  "description" TEXT,
  "governorate" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "job_type" TEXT NOT NULL,
  "shift" TEXT,
  "salary_min" INTEGER,
  "salary_max" INTEGER,
  "is_emergency" BOOLEAN NOT NULL DEFAULT false,
  "status" "job_status" NOT NULL DEFAULT 'active',
  "lat" DOUBLE PRECISION,
  "lng" DOUBLE PRECISION,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE "applications" (
  "id" SERIAL PRIMARY KEY,
  "job_id" INTEGER NOT NULL,
  "candidate_id" INTEGER NOT NULL,
  "cover_letter" TEXT,
  "status" "application_status" NOT NULL DEFAULT 'pending',
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE "offers" (
  "id" SERIAL PRIMARY KEY,
  "employer_id" INTEGER NOT NULL,
  "candidate_id" INTEGER NOT NULL,
  "message" TEXT NOT NULL,
  "status" "offer_status" NOT NULL DEFAULT 'pending',
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE "notifications" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL,
  "type" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "is_read" BOOLEAN NOT NULL DEFAULT false,
  "link" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE "packages" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "name_ar" TEXT NOT NULL,
  "target_role" "target_role" NOT NULL,
  "price_usd" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "daily_limit" INTEGER NOT NULL,
  "monthly_limit" INTEGER NOT NULL,
  "features" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE "user_subscriptions" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL,
  "package_id" INTEGER NOT NULL,
  "starts_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "ends_at" TIMESTAMPTZ NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE "shortlists" (
  "id" SERIAL PRIMARY KEY,
  "employer_id" INTEGER NOT NULL,
  "candidate_id" INTEGER NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);
