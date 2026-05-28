import { Router, type IRouter } from "express";
import { db, employersTable, candidatesTable, shortlistsTable } from "@workspace/db";
import { eq, and, count } from "drizzle-orm";
import {
  UpdateEmployerProfileBody,
  ListEmployersQueryParams,
  GetEmployerParams,
  AddToShortlistParams,
  RemoveFromShortlistParams,
} from "@workspace/api-zod";
import { requireAuth, calcEmployerProfileCompletion } from "../lib/auth";
import { jobsTable, applicationsTable, offersTable } from "@workspace/db";

const router: IRouter = Router();

function employerToResponse(e: any) {
  return {
    id: e.id,
    userId: e.userId,
    name: e.name,
    ownerName: e.ownerName,
    isGroup: e.isGroup,
    branchCount: e.branchCount,
    governorate: e.governorate,
    city: e.city,
    address: e.address,
    nearbyLandmark: e.nearbyLandmark,
    phone: e.phone,
    whatsapp: e.whatsapp,
    alternatePhone: e.alternatePhone,
    mapsLink: e.mapsLink,
    lat: e.lat,
    lng: e.lng,
    logoUrl: e.logoUrl,
    description: e.description,
    yearEstablished: e.yearEstablished,
    profileCompletionPct: e.profileCompletionPct,
    createdAt: e.createdAt?.toISOString() ?? new Date().toISOString(),
  };
}

router.get("/employers", async (req, res): Promise<void> => {
  const params = ListEmployersQueryParams.safeParse(req.query);
  const page = (params.success && params.data.page) ? params.data.page : 1;
  const limit = (params.success && params.data.limit) ? params.data.limit : 20;
  const offset = (page - 1) * limit;

  let query = db.select().from(employersTable) as any;
  if (params.success) {
    const { governorate, city } = params.data;
    const conditions = [];
    if (governorate) conditions.push(eq(employersTable.governorate, governorate));
    if (city) conditions.push(eq(employersTable.city, city));
    if (conditions.length > 0) query = query.where(and(...conditions));
  }

  const [countResult] = await db.select({ count: count() }).from(employersTable);
  const items = await query.limit(limit).offset(offset);

  res.json({ items: items.map(employerToResponse), total: Number(countResult.count), page, limit });
});

router.get("/employers/me", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  const [employer] = await db.select().from(employersTable).where(eq(employersTable.userId, user.id));
  if (!employer) {
    res.status(404).json({ error: "Employer profile not found" });
    return;
  }
  res.json(employerToResponse(employer));
});

router.put("/employers/me", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  const parsed = UpdateEmployerProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const updateData = { ...parsed.data } as any;
  updateData.profileCompletionPct = calcEmployerProfileCompletion(updateData);

  const [employer] = await db.update(employersTable).set(updateData).where(eq(employersTable.userId, user.id)).returning();
  if (!employer) {
    res.status(404).json({ error: "Employer profile not found" });
    return;
  }
  res.json(employerToResponse(employer));
});

router.get("/employers/me/stats", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  const [employer] = await db.select().from(employersTable).where(eq(employersTable.userId, user.id));
  if (!employer) {
    res.status(404).json({ error: "Employer not found" });
    return;
  }

  const activeJobs = await db.select({ count: count() }).from(jobsTable).where(and(eq(jobsTable.employerId, employer.id), eq(jobsTable.status, "active")));
  const shortlistCount = await db.select({ count: count() }).from(shortlistsTable).where(eq(shortlistsTable.employerId, employer.id));

  const myJobIds = (await db.select({ id: jobsTable.id }).from(jobsTable).where(eq(jobsTable.employerId, employer.id))).map((j) => j.id);
  let totalApps = 0;
  let pendingApps = 0;
  if (myJobIds.length > 0) {
    const apps = await db.select().from(applicationsTable);
    const myApps = apps.filter((a) => myJobIds.includes(a.jobId));
    totalApps = myApps.length;
    pendingApps = myApps.filter((a) => a.status === "pending").length;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const month = new Date(today.getFullYear(), today.getMonth(), 1);
  const allOffers = await db.select().from(offersTable).where(eq(offersTable.employerId, employer.id));
  const dailyOffers = allOffers.filter((o) => new Date(o.createdAt) >= today).length;
  const monthlyOffers = allOffers.filter((o) => new Date(o.createdAt) >= month).length;

  res.json({
    activeJobs: Number(activeJobs[0].count),
    totalApplicationsReceived: totalApps,
    dailyOffersUsed: dailyOffers,
    dailyOffersLimit: 3,
    monthlyOffersUsed: monthlyOffers,
    monthlyOffersLimit: 20,
    shortlistCount: Number(shortlistCount[0].count),
    pendingApplications: pendingApps,
  });
});

router.get("/employers/me/shortlist", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  const [employer] = await db.select().from(employersTable).where(eq(employersTable.userId, user.id));
  if (!employer) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const entries = await db.select().from(shortlistsTable).where(eq(shortlistsTable.employerId, employer.id));
  const candidateIds = entries.map((e) => e.candidateId);
  if (candidateIds.length === 0) {
    res.json([]);
    return;
  }
  const candidates = await db.select().from(candidatesTable);
  const filtered = candidates.filter((c) => candidateIds.includes(c.id));
  res.json(filtered.map((c) => ({
    id: c.id, userId: c.userId, fullName: c.fullName, governorate: c.governorate, city: c.city,
    specialization: c.specialization, yearsExperience: c.yearsExperience, availableForWork: c.availableForWork,
    profileCompletionPct: c.profileCompletionPct, isVerified: c.isVerified, verificationBadge: c.verificationBadge,
    profilePicture: c.profilePicture, personalSummary: c.personalSummary,
    email: null, phone: null, whatsapp: null, dateOfBirth: null, gender: null, address: null,
    university: null, faculty: null, graduationYear: null, grade: null, previousWorkplaces: null,
    pharmacySkills: null, computerSkills: null, communicationSkills: null, certifications: null, courses: null,
    preferredShift: c.preferredShift, jobType: c.jobType, maxDistanceKm: c.maxDistanceKm,
    cvUrl: null, lat: c.lat, lng: c.lng,
    createdAt: c.createdAt?.toISOString() ?? new Date().toISOString(),
  })));
});

router.post("/employers/me/shortlist/:candidateId", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  const raw = Array.isArray(req.params.candidateId) ? req.params.candidateId[0] : req.params.candidateId;
  const candidateId = parseInt(raw, 10);
  if (isNaN(candidateId)) {
    res.status(400).json({ error: "Invalid candidateId" });
    return;
  }
  const [employer] = await db.select().from(employersTable).where(eq(employersTable.userId, user.id));
  if (!employer) {
    res.status(404).json({ error: "Employer not found" });
    return;
  }
  const existing = await db.select().from(shortlistsTable).where(and(eq(shortlistsTable.employerId, employer.id), eq(shortlistsTable.candidateId, candidateId)));
  if (existing.length > 0) {
    res.json(existing[0]);
    return;
  }
  const [entry] = await db.insert(shortlistsTable).values({ employerId: employer.id, candidateId }).returning();
  res.json(entry);
});

router.delete("/employers/me/shortlist/:candidateId", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  const raw = Array.isArray(req.params.candidateId) ? req.params.candidateId[0] : req.params.candidateId;
  const candidateId = parseInt(raw, 10);
  if (isNaN(candidateId)) {
    res.status(400).json({ error: "Invalid candidateId" });
    return;
  }
  const [employer] = await db.select().from(employersTable).where(eq(employersTable.userId, user.id));
  if (!employer) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  await db.delete(shortlistsTable).where(and(eq(shortlistsTable.employerId, employer.id), eq(shortlistsTable.candidateId, candidateId)));
  res.sendStatus(204);
});

router.get("/employers/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [employer] = await db.select().from(employersTable).where(eq(employersTable.id, id));
  if (!employer) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(employerToResponse(employer));
});

export default router;
