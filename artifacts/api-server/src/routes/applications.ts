import { Router, type IRouter } from "express";
import { db, applicationsTable, candidatesTable, jobsTable, employersTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import {
  CreateApplicationBody,
  GetApplicationParams,
  UpdateApplicationStatusBody,
  UpdateApplicationStatusParams,
} from "@workspace/api-zod";
import { requireAuth } from "../lib/auth";

const router: IRouter = Router();

async function appToResponse(a: any) {
  const [candidate] = await db.select({ fullName: candidatesTable.fullName }).from(candidatesTable).where(eq(candidatesTable.id, a.candidateId));
  const [job] = await db.select({ title: jobsTable.title, employerId: jobsTable.employerId }).from(jobsTable).where(eq(jobsTable.id, a.jobId));
  let employerName = null;
  if (job) {
    const [emp] = await db.select({ name: employersTable.name }).from(employersTable).where(eq(employersTable.id, job.employerId));
    employerName = emp?.name ?? null;
  }
  return {
    id: a.id,
    jobId: a.jobId,
    candidateId: a.candidateId,
    candidateName: candidate?.fullName ?? null,
    jobTitle: job?.title ?? null,
    employerName,
    coverLetter: a.coverLetter,
    status: a.status,
    createdAt: a.createdAt?.toISOString() ?? new Date().toISOString(),
  };
}

router.get("/applications", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  let apps: any[] = [];

  if (user.role === "candidate") {
    const [candidate] = await db.select().from(candidatesTable).where(eq(candidatesTable.userId, user.id));
    if (!candidate) {
      res.json([]);
      return;
    }
    apps = await db.select().from(applicationsTable).where(eq(applicationsTable.candidateId, candidate.id));
  } else if (user.role === "employer") {
    const [employer] = await db.select().from(employersTable).where(eq(employersTable.userId, user.id));
    if (!employer) {
      res.json([]);
      return;
    }
    const myJobs = await db.select({ id: jobsTable.id }).from(jobsTable).where(eq(jobsTable.employerId, employer.id));
    const myJobIds = myJobs.map((j) => j.id);
    if (myJobIds.length === 0) {
      res.json([]);
      return;
    }
    const allApps = await db.select().from(applicationsTable);
    apps = allApps.filter((a) => myJobIds.includes(a.jobId));
  } else {
    apps = await db.select().from(applicationsTable);
  }

  const result = await Promise.all(apps.map(appToResponse));
  res.json(result);
});

router.post("/applications", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  const parsed = CreateApplicationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [candidate] = await db.select().from(candidatesTable).where(eq(candidatesTable.userId, user.id));
  if (!candidate) {
    res.status(403).json({ error: "Candidate profile required" });
    return;
  }

  if (candidate.profileCompletionPct < 80) {
    res.status(400).json({ error: "Profile must be at least 80% complete to apply" });
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const allApps = await db.select().from(applicationsTable).where(eq(applicationsTable.candidateId, candidate.id));
  const dailyCount = allApps.filter((a) => new Date(a.createdAt) >= today).length;
  if (dailyCount >= 10) {
    res.status(429).json({ error: "Daily application limit reached (10/day)" });
    return;
  }

  const existing = await db.select().from(applicationsTable).where(and(eq(applicationsTable.jobId, parsed.data.jobId), eq(applicationsTable.candidateId, candidate.id)));
  if (existing.length > 0) {
    res.status(400).json({ error: "Already applied to this job" });
    return;
  }

  const [app] = await db.insert(applicationsTable).values({ jobId: parsed.data.jobId, candidateId: candidate.id, coverLetter: parsed.data.coverLetter }).returning();
  const response = await appToResponse(app);
  res.status(201).json(response);
});

router.get("/applications/:id", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [app] = await db.select().from(applicationsTable).where(eq(applicationsTable.id, id));
  if (!app) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(await appToResponse(app));
});

router.patch("/applications/:id", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const parsed = UpdateApplicationStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [app] = await db.update(applicationsTable).set({ status: parsed.data.status }).where(eq(applicationsTable.id, id)).returning();
  if (!app) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(await appToResponse(app));
});

export default router;
