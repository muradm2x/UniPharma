import { Router, type IRouter } from "express";
import { db, candidatesTable, applicationsTable, offersTable } from "@workspace/db";
import { eq, and, count, sql } from "drizzle-orm";
import {
  UpdateCandidateProfileBody,
  ToggleCandidateAvailabilityBody,
  ListCandidatesQueryParams,
  GetCandidateParams,
} from "@workspace/api-zod";
import { requireAuth, calcProfileCompletion } from "../lib/auth";

const router: IRouter = Router();

function candidateToResponse(c: any) {
  return {
    id: c.id,
    userId: c.userId,
    fullName: c.fullName,
    email: null,
    phone: c.phone,
    whatsapp: c.whatsapp,
    dateOfBirth: c.dateOfBirth,
    gender: c.gender,
    governorate: c.governorate,
    city: c.city,
    address: c.address,
    university: c.university,
    faculty: c.faculty,
    graduationYear: c.graduationYear,
    grade: c.grade,
    specialization: c.specialization,
    yearsExperience: c.yearsExperience,
    previousWorkplaces: c.previousWorkplaces,
    pharmacySkills: c.pharmacySkills,
    computerSkills: c.computerSkills,
    communicationSkills: c.communicationSkills,
    certifications: c.certifications,
    courses: c.courses,
    availableForWork: c.availableForWork,
    preferredShift: c.preferredShift,
    jobType: c.jobType,
    maxDistanceKm: c.maxDistanceKm,
    profilePicture: c.profilePicture,
    personalSummary: c.personalSummary,
    cvUrl: c.cvUrl,
    lat: c.lat,
    lng: c.lng,
    profileCompletionPct: c.profileCompletionPct,
    isVerified: c.isVerified,
    verificationBadge: c.verificationBadge,
    createdAt: c.createdAt?.toISOString() ?? new Date().toISOString(),
  };
}

router.get("/candidates", async (req, res): Promise<void> => {
  const params = ListCandidatesQueryParams.safeParse(req.query);
  const page = (params.success && params.data.page) ? params.data.page : 1;
  const limit = (params.success && params.data.limit) ? params.data.limit : 20;
  const offset = (page - 1) * limit;

  let query = db.select().from(candidatesTable) as any;
  if (params.success) {
    const { governorate, city, specialization, availableNow } = params.data;
    const conditions = [];
    if (governorate) conditions.push(eq(candidatesTable.governorate, governorate));
    if (city) conditions.push(eq(candidatesTable.city, city));
    if (specialization) conditions.push(eq(candidatesTable.specialization, specialization));
    if (availableNow === true) conditions.push(eq(candidatesTable.availableForWork, true));
    if (conditions.length > 0) query = query.where(and(...conditions));
  }

  const [countResult] = await db.select({ count: count() }).from(candidatesTable);
  const items = await query.limit(limit).offset(offset);

  res.json({ items: items.map(candidateToResponse), total: Number(countResult.count), page, limit });
});

router.get("/candidates/me", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  const [candidate] = await db.select().from(candidatesTable).where(eq(candidatesTable.userId, user.id));
  if (!candidate) {
    res.status(404).json({ error: "Candidate profile not found" });
    return;
  }
  res.json(candidateToResponse(candidate));
});

router.put("/candidates/me", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  const parsed = UpdateCandidateProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData = { ...parsed.data } as any;
  const completion = calcProfileCompletion({ ...updateData });
  updateData.profileCompletionPct = completion;

  const [candidate] = await db.update(candidatesTable).set(updateData).where(eq(candidatesTable.userId, user.id)).returning();
  if (!candidate) {
    res.status(404).json({ error: "Candidate profile not found" });
    return;
  }
  res.json(candidateToResponse(candidate));
});

router.patch("/candidates/me/availability", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  const parsed = ToggleCandidateAvailabilityBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [candidate] = await db.update(candidatesTable).set({ availableForWork: parsed.data.availableForWork }).where(eq(candidatesTable.userId, user.id)).returning();
  if (!candidate) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }
  res.json(candidateToResponse(candidate));
});

router.get("/candidates/me/stats", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  const [candidate] = await db.select().from(candidatesTable).where(eq(candidatesTable.userId, user.id));
  if (!candidate) {
    res.status(404).json({ error: "Candidate not found" });
    return;
  }

  const allApps = await db.select().from(applicationsTable).where(eq(applicationsTable.candidateId, candidate.id));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const month = new Date(today.getFullYear(), today.getMonth(), 1);

  const dailyUsed = allApps.filter((a) => new Date(a.createdAt) >= today).length;
  const monthlyUsed = allApps.filter((a) => new Date(a.createdAt) >= month).length;

  const pendingOffers = await db.select({ count: count() }).from(offersTable)
    .where(and(eq(offersTable.candidateId, candidate.id), eq(offersTable.status, "pending")));

  res.json({
    profileCompletionPct: candidate.profileCompletionPct,
    dailyApplicationsUsed: dailyUsed,
    dailyApplicationsLimit: 10,
    monthlyApplicationsUsed: monthlyUsed,
    monthlyApplicationsLimit: 50,
    totalApplications: allApps.length,
    pendingApplications: allApps.filter((a) => a.status === "pending").length,
    acceptedApplications: allApps.filter((a) => a.status === "accepted").length,
    rejectedApplications: allApps.filter((a) => a.status === "rejected").length,
    unreadOffers: Number(pendingOffers[0].count),
  });
});

router.get("/candidates/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [candidate] = await db.select().from(candidatesTable).where(eq(candidatesTable.id, id));
  if (!candidate) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(candidateToResponse(candidate));
});

export default router;
