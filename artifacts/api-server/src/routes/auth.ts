import { Router, type IRouter } from "express";
import { db, usersTable, candidatesTable, employersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { RegisterBody, LoginBody } from "@workspace/api-zod";
import { hashPassword, createToken, requireAuth } from "../lib/auth";

const router: IRouter = Router();

router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { email, password, role, fullName, phone } = parsed.data;

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing.length > 0) {
    res.status(400).json({ error: "Email already registered" });
    return;
  }

  const passwordHash = hashPassword(password);
  const [user] = await db.insert(usersTable).values({ email, passwordHash, role, fullName, phone }).returning();

  if (role === "candidate") {
    await db.insert(candidatesTable).values({ userId: user.id, fullName, phone: phone ?? null, governorate: "", city: "", specialization: "", yearsExperience: 0 });
  } else if (role === "employer") {
    await db.insert(employersTable).values({ userId: user.id, name: fullName, governorate: "", city: "" });
  }

  const token = createToken(user.id, user.role);
  res.status(201).json({
    token,
    user: { id: user.id, email: user.email, role: user.role, fullName: user.fullName, phone: user.phone, createdAt: user.createdAt.toISOString() },
  });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { email, password } = parsed.data;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  if (user.passwordHash !== hashPassword(password)) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const token = createToken(user.id, user.role);
  res.json({
    token,
    user: { id: user.id, email: user.email, role: user.role, fullName: user.fullName, phone: user.phone, createdAt: user.createdAt.toISOString() },
  });
});

router.get("/auth/me", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  res.json({ id: user.id, email: user.email, role: user.role, fullName: user.fullName, phone: user.phone, createdAt: user.createdAt.toISOString() });
});

export default router;
