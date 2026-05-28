import { Router, type IRouter } from "express";
import { db, usersTable, candidatesTable, employersTable, jobsTable, applicationsTable, packagesTable, userSubscriptionsTable } from "@workspace/db";
import { eq, count, sql } from "drizzle-orm";
import {
  ListAdminUsersQueryParams,
  VerifyCandidateCredentialsBody,
  VerifyCandidateCredentialsParams,
} from "@workspace/api-zod";
import { requireAuth } from "../lib/auth";

const router: IRouter = Router();

router.get("/admin/stats", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  if (user.role !== "admin") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const month = new Date(today.getFullYear(), today.getMonth(), 1);

  const [totalUsers] = await db.select({ count: count() }).from(usersTable);
  const [totalCandidates] = await db.select({ count: count() }).from(candidatesTable);
  const [totalEmployers] = await db.select({ count: count() }).from(employersTable);
  const [totalJobs] = await db.select({ count: count() }).from(jobsTable);
  const [totalApplications] = await db.select({ count: count() }).from(applicationsTable);
  const [activeSubscriptions] = await db.select({ count: count() }).from(userSubscriptionsTable).where(eq(userSubscriptionsTable.isActive, true));

  const allUsers = await db.select().from(usersTable);
  const newUsersToday = allUsers.filter((u) => new Date(u.createdAt) >= today).length;
  const newUsersThisMonth = allUsers.filter((u) => new Date(u.createdAt) >= month).length;

  const [accepted] = await db.select({ count: count() }).from(applicationsTable).where(eq(applicationsTable.status, "accepted"));

  res.json({
    totalUsers: Number(totalUsers.count),
    totalCandidates: Number(totalCandidates.count),
    totalEmployers: Number(totalEmployers.count),
    totalJobs: Number(totalJobs.count),
    totalApplications: Number(totalApplications.count),
    successfulMatches: Number(accepted.count),
    newUsersToday,
    newUsersThisMonth,
    activeSubscriptions: Number(activeSubscriptions.count),
  });
});

router.get("/admin/users", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  if (user.role !== "admin") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  const params = ListAdminUsersQueryParams.safeParse(req.query);
  const page = (params.success && params.data.page) ? params.data.page : 1;
  const limit = (params.success && params.data.limit) ? params.data.limit : 20;
  const offset = (page - 1) * limit;
  const [countResult] = await db.select({ count: count() }).from(usersTable);
  const users = await db.select().from(usersTable).limit(limit).offset(offset);
  res.json({
    items: users.map((u) => ({ id: u.id, email: u.email, role: u.role, fullName: u.fullName, phone: u.phone, createdAt: u.createdAt.toISOString() })),
    total: Number(countResult.count),
    page,
    limit,
  });
});

router.get("/admin/verification-queue", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  if (user.role !== "admin") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  const candidates = await db.select().from(candidatesTable).where(eq(candidatesTable.isVerified, false));
  res.json(candidates.map((c) => ({
    id: c.id, userId: c.userId, fullName: c.fullName, governorate: c.governorate, city: c.city,
    specialization: c.specialization, yearsExperience: c.yearsExperience, availableForWork: c.availableForWork,
    profileCompletionPct: c.profileCompletionPct, isVerified: c.isVerified, verificationBadge: c.verificationBadge,
    profilePicture: c.profilePicture, personalSummary: c.personalSummary,
    email: null, phone: null, whatsapp: null, dateOfBirth: null, gender: null, address: null,
    university: c.university, faculty: c.faculty, graduationYear: c.graduationYear, grade: c.grade,
    previousWorkplaces: c.previousWorkplaces, pharmacySkills: c.pharmacySkills, computerSkills: c.computerSkills,
    communicationSkills: c.communicationSkills, certifications: c.certifications, courses: c.courses,
    preferredShift: c.preferredShift, jobType: c.jobType, maxDistanceKm: c.maxDistanceKm,
    cvUrl: c.cvUrl, lat: c.lat, lng: c.lng,
    createdAt: c.createdAt?.toISOString() ?? new Date().toISOString(),
  })));
});

router.patch("/admin/verify/:candidateId", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  if (user.role !== "admin") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  const raw = Array.isArray(req.params.candidateId) ? req.params.candidateId[0] : req.params.candidateId;
  const candidateId = parseInt(raw, 10);
  if (isNaN(candidateId)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const parsed = VerifyCandidateCredentialsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [candidate] = await db.update(candidatesTable).set({ isVerified: parsed.data.verified, verificationBadge: parsed.data.badge ?? (parsed.data.verified ? "verified" : null) }).where(eq(candidatesTable.id, candidateId)).returning();
  if (!candidate) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json({ id: candidate.id, userId: candidate.userId, fullName: candidate.fullName, governorate: candidate.governorate, city: candidate.city, specialization: candidate.specialization, yearsExperience: candidate.yearsExperience, availableForWork: candidate.availableForWork, profileCompletionPct: candidate.profileCompletionPct, isVerified: candidate.isVerified, verificationBadge: candidate.verificationBadge, profilePicture: candidate.profilePicture, personalSummary: candidate.personalSummary, email: null, phone: null, whatsapp: null, dateOfBirth: null, gender: null, address: null, university: candidate.university, faculty: candidate.faculty, graduationYear: candidate.graduationYear, grade: candidate.grade, previousWorkplaces: candidate.previousWorkplaces, pharmacySkills: candidate.pharmacySkills, computerSkills: candidate.computerSkills, communicationSkills: candidate.communicationSkills, certifications: candidate.certifications, courses: candidate.courses, preferredShift: candidate.preferredShift, jobType: candidate.jobType, maxDistanceKm: candidate.maxDistanceKm, cvUrl: candidate.cvUrl, lat: candidate.lat, lng: candidate.lng, createdAt: candidate.createdAt?.toISOString() ?? new Date().toISOString() });
});

router.get("/admin/subscriptions-breakdown", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  if (user.role !== "admin") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  const packages = await db.select().from(packagesTable);
  const subs = await db.select().from(userSubscriptionsTable).where(eq(userSubscriptionsTable.isActive, true));
  const result = packages.map((p) => ({
    packageId: p.id,
    packageName: p.name,
    packageNameAr: p.nameAr,
    count: subs.filter((s) => s.packageId === p.id).length,
  }));
  res.json(result);
});

router.get("/admin/activity-by-region", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  if (user.role !== "admin") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  const candidates = await db.select().from(candidatesTable);
  const employers = await db.select().from(employersTable);
  const jobs = await db.select().from(jobsTable);
  const applications = await db.select().from(applicationsTable);

  const allGovernorates = new Set([
    ...candidates.map((c) => c.governorate),
    ...employers.map((e) => e.governorate),
    ...jobs.map((j) => j.governorate),
  ].filter(Boolean));

  const result = Array.from(allGovernorates).map((gov) => {
    const govJobs = jobs.filter((j) => j.governorate === gov);
    const govJobIds = govJobs.map((j) => j.id);
    return {
      governorate: gov,
      candidateCount: candidates.filter((c) => c.governorate === gov).length,
      employerCount: employers.filter((e) => e.governorate === gov).length,
      jobCount: govJobs.length,
      applicationCount: applications.filter((a) => govJobIds.includes(a.jobId)).length,
    };
  }).sort((a, b) => b.candidateCount - a.candidateCount);

  res.json(result);
});

export default router;
