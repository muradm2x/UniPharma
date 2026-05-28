import { Router, type IRouter } from "express";
import { db, notificationsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { MarkNotificationReadParams } from "@workspace/api-zod";
import { requireAuth } from "../lib/auth";

const router: IRouter = Router();

router.get("/notifications", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  const notifications = await db.select().from(notificationsTable).where(eq(notificationsTable.userId, user.id));
  res.json(notifications.map((n) => ({
    id: n.id,
    userId: n.userId,
    type: n.type,
    title: n.title,
    body: n.body,
    isRead: n.isRead,
    link: n.link,
    createdAt: n.createdAt?.toISOString() ?? new Date().toISOString(),
  })));
});

router.patch("/notifications/:id/read", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [notification] = await db.update(notificationsTable).set({ isRead: true }).where(eq(notificationsTable.id, id)).returning();
  if (!notification) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json({ id: notification.id, userId: notification.userId, type: notification.type, title: notification.title, body: notification.body, isRead: notification.isRead, link: notification.link, createdAt: notification.createdAt?.toISOString() });
});

router.patch("/notifications/read-all", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  await db.update(notificationsTable).set({ isRead: true }).where(eq(notificationsTable.userId, user.id));
  res.json({ success: true });
});

export default router;
