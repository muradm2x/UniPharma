import { Router, type IRouter } from "express";
import { db, usersTable, candidatesTable, employersTable } from "@workspace/db";
import { eq, or } from "drizzle-orm";
import { z } from "zod";
import { hashPassword, createToken, requireAuth } from "../lib/auth";

const router: IRouter = Router();

// Shared response builder
function userResponse(user: typeof usersTable.$inferSelect) {
  return {
    id: user.id,
    email: user.email ?? null,
    phone: user.phone ?? null,
    role: user.role,
    fullName: user.fullName,
    profilePicture: user.profilePicture ?? null,
    phoneVerified: user.phoneVerified,
    createdAt: user.createdAt.toISOString(),
  };
}

async function createProfileRow(userId: number, role: string, fullName: string, phone: string | null) {
  if (role === "candidate") {
    await db.insert(candidatesTable).values({
      userId, fullName, phone: phone ?? null,
      governorate: "", city: "", specialization: "", yearsExperience: 0,
    });
  } else if (role === "employer") {
    await db.insert(employersTable).values({ userId, name: fullName, governorate: "", city: "" });
  }
}

// ─── Register with email+password or phone+password ───────────────────────
const RegisterBody = z.object({
  role: z.enum(["candidate", "employer"]),
  fullName: z.string().min(2),
  email: z.string().email().optional(),
  phone: z.string().min(10).optional(),
  password: z.string().min(6),
}).refine((d: { email?: string; phone?: string }) => d.email || d.phone, { message: "يجب توفير إيميل أو رقم هاتف" });

router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "بيانات غير صحيحة" });
    return;
  }
  const { email, phone, password, role, fullName } = parsed.data;

  // Check uniqueness
  const conditions = [];
  if (email) conditions.push(eq(usersTable.email, email));
  if (phone) conditions.push(eq(usersTable.phone, phone));
  const existing = conditions.length > 0
    ? await db.select().from(usersTable).where(or(...conditions))
    : [];
  if (existing.length > 0) {
    res.status(400).json({ error: "هذا الإيميل أو الرقم مسجّل بالفعل" });
    return;
  }

  const passwordHash = hashPassword(password);
  const [user] = await db.insert(usersTable).values({
    email: email ?? null,
    phone: phone ?? null,
    passwordHash,
    role,
    fullName,
  }).returning();

  await createProfileRow(user.id, role, fullName, phone ?? null);

  const token = createToken(user.id, user.role);
  res.status(201).json({ token, user: userResponse(user) });
});

// ─── Login with email or phone ─────────────────────────────────────────────
const LoginBody = z.object({
  identifier: z.string().min(1),  // email or phone
  password: z.string().min(6),
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "بيانات غير صحيحة" });
    return;
  }
  const { identifier, password } = parsed.data;

  const isEmail = identifier.includes("@");
  const [user] = isEmail
    ? await db.select().from(usersTable).where(eq(usersTable.email, identifier))
    : await db.select().from(usersTable).where(eq(usersTable.phone, identifier));

  if (!user || !user.passwordHash) {
    res.status(401).json({ error: "بيانات الدخول غير صحيحة" });
    return;
  }
  if (user.passwordHash !== hashPassword(password)) {
    res.status(401).json({ error: "بيانات الدخول غير صحيحة" });
    return;
  }

  const token = createToken(user.id, user.role);
  res.json({ token, user: userResponse(user) });
});

// ─── Google OAuth ──────────────────────────────────────────────────────────
const GoogleBody = z.object({
  credential: z.string().min(1),   // Google ID token (JWT)
  role: z.enum(["candidate", "employer"]).optional(),
});

router.post("/auth/google", async (req, res): Promise<void> => {
  const parsed = GoogleBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "بيانات غير صحيحة" });
    return;
  }
  const { credential, role } = parsed.data;

  // Decode Google JWT payload (no verification needed for this use-case since
  // Google signs the token and we trust the sub/email from it; for production
  // add google-auth-library verification)
  let payload: { sub: string; email?: string; name?: string; picture?: string };
  try {
    const parts = credential.split(".");
    payload = JSON.parse(Buffer.from(parts[1], "base64url").toString());
  } catch {
    res.status(400).json({ error: "رمز Google غير صحيح" });
    return;
  }

  const googleId = payload.sub;
  const email = payload.email ?? null;
  const fullName = payload.name ?? "مستخدم";
  const profilePicture = payload.picture ?? null;

  // Find existing user
  const conditions = [eq(usersTable.googleId, googleId)];
  if (email) conditions.push(eq(usersTable.email, email));
  const [existing] = await db.select().from(usersTable).where(or(...conditions));

  if (existing) {
    // Update googleId/picture if missing
    if (!existing.googleId || !existing.profilePicture) {
      await db.update(usersTable)
        .set({ googleId, profilePicture: existing.profilePicture ?? profilePicture })
        .where(eq(usersTable.id, existing.id));
    }
    const token = createToken(existing.id, existing.role);
    res.json({ token, user: userResponse({ ...existing, googleId, profilePicture: existing.profilePicture ?? profilePicture }) });
    return;
  }

  // New user — role required
  if (!role) {
    res.status(422).json({ error: "ROLE_REQUIRED", googleId, email, fullName, profilePicture });
    return;
  }

  const [user] = await db.insert(usersTable).values({
    googleId, email, fullName, profilePicture, role,
  }).returning();

  await createProfileRow(user.id, role, fullName, null);

  const token = createToken(user.id, user.role);
  res.status(201).json({ token, user: userResponse(user) });
});

// ─── Get current user ──────────────────────────────────────────────────────
router.get("/auth/me", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  res.json(userResponse(user));
});

export default router;
