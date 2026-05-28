import crypto from "crypto";
import { Request, Response, NextFunction } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const SESSION_SECRET = process.env.SESSION_SECRET ?? "pharmalink-dev-secret";

export function hashPassword(password: string): string {
  return crypto.createHmac("sha256", SESSION_SECRET).update(password).digest("hex");
}

export function createToken(userId: number, role: string): string {
  const payload = { userId, role, exp: Date.now() + 30 * 24 * 60 * 60 * 1000 };
  const data = Buffer.from(JSON.stringify(payload)).toString("base64");
  const sig = crypto.createHmac("sha256", SESSION_SECRET).update(data).digest("base64");
  return `${data}.${sig}`;
}

export function verifyToken(token: string): { userId: number; role: string } | null {
  try {
    const [data, sig] = token.split(".");
    const expectedSig = crypto.createHmac("sha256", SESSION_SECRET).update(data).digest("base64");
    if (sig !== expectedSig) return null;
    const payload = JSON.parse(Buffer.from(data, "base64").toString());
    if (payload.exp < Date.now()) return null;
    return { userId: payload.userId, role: payload.role };
  } catch {
    return null;
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = header.slice(7);
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: "Invalid token" });
    return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, payload.userId));
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }
  (req as any).user = user;
  next();
}

export async function requireRole(role: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await requireAuth(req, res, async () => {
      const user = (req as any).user;
      if (user.role !== role && user.role !== "admin") {
        res.status(403).json({ error: "Forbidden" });
        return;
      }
      next();
    });
  };
}

export function calcProfileCompletion(profile: Record<string, unknown>): number {
  const fields = ["fullName", "phone", "governorate", "city", "specialization", "yearsExperience", "personalSummary", "profilePicture"];
  const filled = fields.filter((f) => profile[f] != null && profile[f] !== "" && profile[f] !== 0).length;
  return Math.round((filled / fields.length) * 100);
}

export function calcEmployerProfileCompletion(profile: Record<string, unknown>): number {
  const fields = ["name", "ownerName", "governorate", "city", "phone", "description"];
  const filled = fields.filter((f) => profile[f] != null && profile[f] !== "").length;
  return Math.round((filled / fields.length) * 100);
}
