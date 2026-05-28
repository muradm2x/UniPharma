import { Router, type IRouter } from "express";
import { db, jobsTable, employersTable, applicationsTable } from "@workspace/db";
import { eq, and, count } from "drizzle-orm";
import {
  CreateJobBody,
  UpdateJobBody,
  UpdateJobParams,
  GetJobParams,
  DeleteJobParams,
  ListJobsQueryParams,
  GetNearbyJobsQueryParams,
  CreateEmergencyShiftBody,
} from "@workspace/api-zod";
import { requireAuth } from "../lib/auth";

const router: IRouter = Router();

function jobToResponse(j: any, employerName?: string | null, applicantCount?: number) {
  return {
    id: j.id,
    employerId: j.employerId,
    employerName: employerName ?? null,
    title: j.title,
    specialization: j.specialization,
    description: j.description,
    governorate: j.governorate,
    city: j.city,
    jobType: j.jobType,
    shift: j.shift,
    salaryMin: j.salaryMin,
    salaryMax: j.salaryMax,
    isEmergency: j.isEmergency,
    status: j.status,
    applicantCount: applicantCount ?? null,
    lat: j.lat,
    lng: j.lng,
    createdAt: j.createdAt?.toISOString() ?? new Date().toISOString(),
  };
}

router.get("/jobs/nearby", async (req, res): Promise<void> => {
  const params = GetNearbyJobsQueryParams.safeParse(req.query);
  const limit = (params.success && params.data.limit) ? params.data.limit : 5;
  const jobs = await db.select().from(jobsTable).where(eq(jobsTable.status, "active")).limit(limit);
  res.json(jobs.map((j) => jobToResponse(j)));
});

router.get("/jobs/emergency", async (_req, res): Promise<void> => {
  const jobs = await db.select().from(jobsTable).where(and(eq(jobsTable.isEmergency, true), eq(jobsTable.status, "active"))).limit(10);
  res.json(jobs.map((j) => jobToResponse(j)));
});

router.get("/jobs", async (req, res): Promise<void> => {
  const params = ListJobsQueryParams.safeParse(req.query);
  const page = (params.success && params.data.page) ? params.data.page : 1;
  const limit = (params.success && params.data.limit) ? params.data.limit : 20;
  const offset = (page - 1) * limit;

  let query = db.select().from(jobsTable) as any;
  const conditions = [eq(jobsTable.status, "active")];
  if (params.success) {
    const { governorate, city, specialization, jobType, isEmergency } = params.data;
    if (governorate) conditions.push(eq(jobsTable.governorate, governorate));
    if (city) conditions.push(eq(jobsTable.city, city));
    if (specialization) conditions.push(eq(jobsTable.specialization, specialization));
    if (jobType) conditions.push(eq(jobsTable.jobType, jobType));
    if (isEmergency === true) conditions.push(eq(jobsTable.isEmergency, true));
  }
  query = query.where(and(...conditions));

  const [countResult] = await db.select({ count: count() }).from(jobsTable).where(eq(jobsTable.status, "active"));
  const jobs = await query.limit(limit).offset(offset);

  const employers = await db.select({ id: employersTable.id, name: employersTable.name }).from(employersTable);
  const empMap = new Map(employers.map((e) => [e.id, e.name]));

  res.json({
    items: jobs.map((j: any) => jobToResponse(j, empMap.get(j.employerId))),
    total: Number(countResult.count),
    page,
    limit,
  });
});

router.post("/jobs", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  const parsed = CreateJobBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [employer] = await db.select().from(employersTable).where(eq(employersTable.userId, user.id));
  if (!employer) {
    res.status(403).json({ error: "Employer profile required" });
    return;
  }
  const [job] = await db.insert(jobsTable).values({ ...parsed.data, employerId: employer.id }).returning();
  res.status(201).json(jobToResponse(job, employer.name));
});

router.get("/jobs/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, id));
  if (!job) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const [employer] = await db.select().from(employersTable).where(eq(employersTable.id, job.employerId));
  const [appCount] = await db.select({ count: count() }).from(applicationsTable).where(eq(applicationsTable.jobId, id));
  res.json(jobToResponse(job, employer?.name, Number(appCount.count)));
});

router.patch("/jobs/:id", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const parsed = UpdateJobBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [job] = await db.update(jobsTable).set(parsed.data as any).where(eq(jobsTable.id, id)).returning();
  if (!job) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(jobToResponse(job));
});

router.delete("/jobs/:id", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db.delete(jobsTable).where(eq(jobsTable.id, id));
  res.sendStatus(204);
});

router.post("/jobs/emergency", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  const parsed = CreateEmergencyShiftBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [employer] = await db.select().from(employersTable).where(eq(employersTable.userId, user.id));
  if (!employer) {
    res.status(403).json({ error: "Employer profile required" });
    return;
  }
  const { specialization, governorate, city, durationHours, notes, lat, lng } = parsed.data;
  const [job] = await db.insert(jobsTable).values({
    employerId: employer.id,
    title: `تغطية فورية - ${specialization}`,
    specialization,
    description: notes ?? `مطلوب ${specialization} لمدة ${durationHours} ساعة`,
    governorate,
    city,
    jobType: "شفت",
    isEmergency: true,
    lat,
    lng,
  }).returning();
  res.status(201).json(jobToResponse(job, employer.name));
});

export default router;
