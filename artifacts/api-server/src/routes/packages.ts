import { Router, type IRouter } from "express";
import { db, packagesTable, userSubscriptionsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { SubscribeToPackageBody } from "@workspace/api-zod";
import { requireAuth } from "../lib/auth";

const router: IRouter = Router();

function pkgToResponse(p: any) {
  return { id: p.id, name: p.name, nameAr: p.nameAr, targetRole: p.targetRole, priceUsd: p.priceUsd, dailyLimit: p.dailyLimit, monthlyLimit: p.monthlyLimit, features: p.features };
}

router.get("/packages", async (_req, res): Promise<void> => {
  const packages = await db.select().from(packagesTable);
  res.json(packages.map(pkgToResponse));
});

router.post("/packages/subscribe", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  const parsed = SubscribeToPackageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [pkg] = await db.select().from(packagesTable).where(eq(packagesTable.id, parsed.data.packageId));
  if (!pkg) {
    res.status(404).json({ error: "Package not found" });
    return;
  }
  await db.update(userSubscriptionsTable).set({ isActive: false }).where(eq(userSubscriptionsTable.userId, user.id));
  const endsAt = new Date();
  endsAt.setMonth(endsAt.getMonth() + 1);
  const [sub] = await db.insert(userSubscriptionsTable).values({ userId: user.id, packageId: pkg.id, endsAt, isActive: true }).returning();
  res.json({ id: sub.id, userId: sub.userId, packageId: sub.packageId, packageName: pkg.name, packageNameAr: pkg.nameAr, dailyLimit: pkg.dailyLimit, monthlyLimit: pkg.monthlyLimit, startsAt: sub.startsAt.toISOString(), endsAt: sub.endsAt.toISOString(), isActive: sub.isActive });
});

router.get("/packages/my-subscription", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  const [sub] = await db.select().from(userSubscriptionsTable).where(and(eq(userSubscriptionsTable.userId, user.id), eq(userSubscriptionsTable.isActive, true)));
  if (!sub) {
    const freePkg = (await db.select().from(packagesTable).where(eq(packagesTable.priceUsd, 0)))[0];
    res.json({ id: 0, userId: user.id, packageId: freePkg?.id ?? 0, packageName: freePkg?.name ?? "Free", packageNameAr: freePkg?.nameAr ?? "مجانية", dailyLimit: freePkg?.dailyLimit ?? 10, monthlyLimit: freePkg?.monthlyLimit ?? 50, startsAt: new Date().toISOString(), endsAt: new Date(9999, 0).toISOString(), isActive: true });
    return;
  }
  const [pkg] = await db.select().from(packagesTable).where(eq(packagesTable.id, sub.packageId));
  res.json({ id: sub.id, userId: sub.userId, packageId: sub.packageId, packageName: pkg?.name ?? "", packageNameAr: pkg?.nameAr ?? "", dailyLimit: pkg?.dailyLimit ?? 10, monthlyLimit: pkg?.monthlyLimit ?? 50, startsAt: sub.startsAt.toISOString(), endsAt: sub.endsAt.toISOString(), isActive: sub.isActive });
});

export default router;
