import "server-only";
import { eq } from "drizzle-orm";
import { verifyPassword } from "@/server/auth/password";
import { createDjangoSession, createSession } from "@/server/auth/session";
import { db } from "@/server/db/client";
import { type UserRow, users } from "@/server/db/schema";
import { HttpError } from "@/server/http";
import { getSharpToolzApiBases } from "@/server/sharptoolz-api";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;
const attempts = new Map<string, { count: number; resetAt: number }>();

/**
 * Per-process sign-in throttle keyed by client address and email. Good enough for one server;
 * move it to the database or Redis before running several instances.
 */
export function throttle(key: string) {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || entry.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return;
  }
  entry.count += 1;
  if (entry.count > MAX_ATTEMPTS) {
    throw new HttpError(429, "Too many sign-in attempts. Wait 15 minutes and try again.");
  }
}

// A real hash of a throwaway password: unknown emails take as long as wrong passwords.
export const DECOY_HASH =
  "scrypt$32768$8$1$AAAAAAAAAAAAAAAAAAAAAA==$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";

/** Clears the throttle after a successful sign-in. */
export function clearThrottle(key: string) {
  attempts.delete(key);
}

async function signInViaDjango(
  email: string,
  password: string,
  clientIp?: string,
  userAgent?: string,
): Promise<UserRow | null> {
  for (const apiBase of getSharpToolzApiBases()) {
    try {
      const res = await fetch(`${apiBase}/fernway/client/auth/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(userAgent ? { "User-Agent": userAgent } : {}),
        },
        body: JSON.stringify({
          email,
          password,
          client_ip: clientIp || "",
          user_agent: userAgent || "",
        }),
        cache: "no-store",
      });
      if (res.ok) {
        const payload = (await res.json()) as {
          token: string;
          user: {
            id: string;
            email: string;
            first_name: string;
            last_name: string;
            phone?: string;
            theme?: string;
          };
        };
        await createDjangoSession(payload.token);
        return {
          id: payload.user.id,
          role: "customer",
          email: payload.user.email,
          passwordHash: "",
          firstName: payload.user.first_name,
          lastName: payload.user.last_name,
          phone: payload.user.phone || "",
          addressLine1: "",
          city: "New York",
          state: "NY",
          postalCode: "10001",
          theme: payload.user.theme || "fernway-ember",
          disabledAt: null,
          createdAt: new Date(),
        };
      }
      if (res.status === 401) {
        return null;
      }
    } catch {
      // Try next port
    }
  }
  return null;
}

export async function signIn(
  email: string,
  password: string,
  clientKey: string,
  userAgent?: string,
): Promise<UserRow> {
  const normalized = email.trim().toLowerCase();
  throttle(`${clientKey}|${normalized}`);

  let localUser: UserRow | undefined;
  let localValid = false;
  try {
    const [row] = await db().select().from(users).where(eq(users.email, normalized)).limit(1);
    localUser = row;
    localValid = await verifyPassword(password, localUser?.passwordHash ?? DECOY_HASH);
  } catch {
    // Local DB not running — fall back to SharpToolz Django auth
  }

  if (localUser && localValid) {
    if (localUser.disabledAt) {
      throw new HttpError(403, "This account is closed. Contact support for help.");
    }
    attempts.delete(`${clientKey}|${normalized}`);
    await createSession(localUser.id);
    return localUser;
  }

  const djangoUser = await signInViaDjango(normalized, password, clientKey, userAgent);
  if (djangoUser) {
    attempts.delete(`${clientKey}|${normalized}`);
    return djangoUser;
  }

  throw new HttpError(401, "That email and password don't match.", {
    password: "That email and password don't match.",
  });
}
