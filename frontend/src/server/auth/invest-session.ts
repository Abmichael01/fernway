import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt, isNull } from "drizzle-orm";
import { cookies } from "next/headers";
import { db } from "@/server/db/client";
import { type InvestUserRow, investSessions, investUsers } from "@/server/db/schema";
import { issueCsrfCookie } from "./session";

/**
 * Fernway Invest sessions. Separate table and cookie from Banking, so an Invest sign-in never
 * opens Banking (or the reverse), even while both run on one domain.
 */
export const INVEST_SESSION_COOKIE = "fw_invest_session";
const SESSION_DAYS = 7;
const isProduction = process.env.NODE_ENV === "production";

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createInvestSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db().insert(investSessions).values({ id: hashToken(token), userId, expiresAt });

  const store = await cookies();
  store.set(INVEST_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
  issueCsrfCookie(store);
}

export async function destroyInvestSession(): Promise<void> {
  const store = await cookies();
  const token = store.get(INVEST_SESSION_COOKIE)?.value;
  if (token) await db().delete(investSessions).where(eq(investSessions.id, hashToken(token)));
  store.delete(INVEST_SESSION_COOKIE);
}

/** Ends every session of a customer (used when the admin disables them or resets the password). */
export async function destroyAllInvestSessions(userId: string): Promise<void> {
  await db().delete(investSessions).where(eq(investSessions.userId, userId));
}

/** The signed-in Invest customer, or null. Disabled customers and expired sessions count as signed out. */
export async function getInvestSessionUser(): Promise<InvestUserRow | null> {
  const token = (await cookies()).get(INVEST_SESSION_COOKIE)?.value;
  if (!token) return null;
  const [row] = await db()
    .select({ user: investUsers })
    .from(investSessions)
    .innerJoin(investUsers, eq(investUsers.id, investSessions.userId))
    .where(and(eq(investSessions.id, hashToken(token)), gt(investSessions.expiresAt, new Date()), isNull(investUsers.disabledAt)))
    .limit(1);
  return row?.user ?? null;
}
