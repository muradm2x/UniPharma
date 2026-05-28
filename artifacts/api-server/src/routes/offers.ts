import { Router, type IRouter } from "express";
import { db, offersTable, employersTable, candidatesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { CreateOfferBody, RespondToOfferBody, RespondToOfferParams } from "@workspace/api-zod";
import { requireAuth } from "../lib/auth";

const router: IRouter = Router();

async function offerToResponse(o: any) {
  const [employer] = await db.select({ name: employersTable.name }).from(employersTable).where(eq(employersTable.id, o.employerId));
  const [candidate] = await db.select({ fullName: candidatesTable.fullName }).from(candidatesTable).where(eq(candidatesTable.id, o.candidateId));
  return {
    id: o.id,
    employerId: o.employerId,
    employerName: employer?.name ?? null,
    candidateId: o.candidateId,
    candidateName: candidate?.fullName ?? null,
    message: o.message,
    status: o.status,
    createdAt: o.createdAt?.toISOString() ?? new Date().toISOString(),
  };
}

router.get("/offers", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  let offers: any[] = [];

  if (user.role === "candidate") {
    const [candidate] = await db.select().from(candidatesTable).where(eq(candidatesTable.userId, user.id));
    if (candidate) {
      offers = await db.select().from(offersTable).where(eq(offersTable.candidateId, candidate.id));
    }
  } else if (user.role === "employer") {
    const [employer] = await db.select().from(employersTable).where(eq(employersTable.userId, user.id));
    if (employer) {
      offers = await db.select().from(offersTable).where(eq(offersTable.employerId, employer.id));
    }
  } else {
    offers = await db.select().from(offersTable);
  }

  const result = await Promise.all(offers.map(offerToResponse));
  res.json(result);
});

router.post("/offers", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  const parsed = CreateOfferBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [employer] = await db.select().from(employersTable).where(eq(employersTable.userId, user.id));
  if (!employer) {
    res.status(403).json({ error: "Employer profile required" });
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const allOffers = await db.select().from(offersTable).where(eq(offersTable.employerId, employer.id));
  const dailyOffers = allOffers.filter((o) => new Date(o.createdAt) >= today).length;
  if (dailyOffers >= 3) {
    res.status(429).json({ error: "Daily offer limit reached (3/day)" });
    return;
  }

  const [offer] = await db.insert(offersTable).values({ employerId: employer.id, candidateId: parsed.data.candidateId, message: parsed.data.message }).returning();
  res.status(201).json(await offerToResponse(offer));
});

router.patch("/offers/:id/respond", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const parsed = RespondToOfferBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [offer] = await db.update(offersTable).set({ status: parsed.data.status }).where(eq(offersTable.id, id)).returning();
  if (!offer) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(await offerToResponse(offer));
});

export default router;
