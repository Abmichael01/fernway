import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt, isNull } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import {
  type FernwayPreviewPayload,
  PREVIEW_HEADER,
  PREVIEW_TOKEN_HEADER,
  parsePreviewPayload,
  sanitizePreviewToken,
} from "@/lib/preview";
import { db } from "@/server/db/client";
import { sessions, type UserRow, users } from "@/server/db/schema";
import { getSharpToolzApiBases } from "@/server/sharptoolz-api";

export const SESSION_COOKIE = "fw_session";
export const CSRF_COOKIE = "csrftoken";
export const DJANGO_SESSION_PREFIX = "django:";
const SESSION_DAYS = 7;

const isProduction = process.env.NODE_ENV === "production";

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Starts a session and sets the HTTP-only cookie. Call from a Route Handler or Server Function. */
export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db().insert(sessions).values({ id: hashToken(token), userId, expiresAt });

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
  // A fresh CSRF token per session.
  issueCsrfCookie(store);
}

/** Starts a session backed by a SharpToolz Django Fernway auth token. */
export async function createDjangoSession(authToken: string): Promise<void> {
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  const store = await cookies();
  store.set(SESSION_COOKIE, `${DJANGO_SESSION_PREFIX}${authToken}`, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
  issueCsrfCookie(store);
}

/** Reads live preview overrides sent from the SharpToolz preview iframe, if present. */
export async function getPreviewOverrides(): Promise<FernwayPreviewPayload | null> {
  try {
    const hdrs = await headers();
    return parsePreviewPayload(hdrs.get(PREVIEW_HEADER));
  } catch {
    return null;
  }
}

/** Reads an explicit per-iframe Fernway auth token sent by the SharpToolz preview iframe. */
export async function getPreviewToken(): Promise<string | null> {
  try {
    const hdrs = await headers();
    return sanitizePreviewToken(hdrs.get(PREVIEW_TOKEN_HEADER));
  } catch {
    return null;
  }
}

/** Reads the active SharpToolz Django Fernway auth token from preview header or session cookie. */
export async function getDjangoSessionToken(): Promise<string | null> {
  const previewToken = await getPreviewToken();
  if (previewToken) return previewToken;
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  if (raw && raw.startsWith(DJANGO_SESSION_PREFIX)) {
    return raw.slice(DJANGO_SESSION_PREFIX.length) || null;
  }
  return null;
}

/** Ends the session server-side and clears the cookie. */
export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token && !token.startsWith(DJANGO_SESSION_PREFIX)) {
    try {
      await db().delete(sessions).where(eq(sessions.id, hashToken(token)));
    } catch {
      // Local DB not running
    }
  }
  store.delete(SESSION_COOKIE);
}

/** The signed-in user, or null. Disabled users and expired sessions count as signed out. */
export async function getSessionUser(): Promise<UserRow | null> {
  const preview = await getPreviewOverrides();
  const previewToken = await getPreviewToken();

  // Draft preview (before account exists in Django): synthesize real UserRow from live form state.
  if (preview && !previewToken && preview.isCreated !== true) {
    return {
      id: "preview-user",
      role: "customer",
      email: preview.email || "alexander@lindenwaybank.com",
      passwordHash: "",
      firstName: preview.firstName || "Alexander",
      lastName: preview.lastName || "Hamilton",
      phone: "+1 (555) 019-2834",
      addressLine1: "742 Evergreen Terrace",
      city: "New York",
      state: "NY",
      postalCode: "10001",
      theme: preview.theme || "fernway-ember",
      disabledAt: null,
      createdAt: new Date(),
    };
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!previewToken && token && !token.startsWith(DJANGO_SESSION_PREFIX)) {
    try {
      const [row] = await db()
        .select({ user: users })
        .from(sessions)
        .innerJoin(users, eq(users.id, sessions.userId))
        .where(and(eq(sessions.id, hashToken(token)), gt(sessions.expiresAt, new Date()), isNull(users.disabledAt)))
        .limit(1);
      if (row?.user) {
        return preview
          ? {
              ...row.user,
              firstName: preview.firstName ?? row.user.firstName,
              lastName: preview.lastName ?? row.user.lastName,
              email: preview.email ?? row.user.email,
              theme: preview.theme ?? row.user.theme,
            }
          : row.user;
      }
    } catch {
      // Local DB not running, fall back to SharpToolz Django
    }
  }

  const djangoToken =
    previewToken ||
    (token?.startsWith(DJANGO_SESSION_PREFIX) ? token.slice(DJANGO_SESSION_PREFIX.length) : undefined);

  // Fallback to SharpToolz Django backend (configured SHARPTOOLZ_API_URL or local dev ports)
  const query = djangoToken ? `?token=${encodeURIComponent(djangoToken)}` : "";
  for (const apiBase of getSharpToolzApiBases()) {
    try {
      const res = await fetch(`${apiBase}/fernway/client/data/${query}`, {
        cache: "no-store",
        headers: djangoToken ? { "X-Fernway-Token": djangoToken } : undefined,
      });
      if (res.ok) {
        const data = (await res.json()) as {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          phone?: string;
          address?: string;
          theme?: string;
          created_at?: string;
        };
        return {
          id: data.id,
          role: "customer",
          email: preview?.email || data.email,
          passwordHash: "",
          firstName: preview?.firstName || data.first_name,
          lastName: preview?.lastName || data.last_name,
          phone: data.phone || "",
          addressLine1: data.address || "",
          city: "New York",
          state: "NY",
          postalCode: "10001",
          theme: preview?.theme || data.theme || "fernway-ember",
          disabledAt: null,
          createdAt: new Date(data.created_at || Date.now()),
        };
      }
    } catch {
      // Try next port
    }
  }

  if (preview) {
    return {
      id: "preview-user",
      role: "customer",
      email: preview.email || "alexander@lindenwaybank.com",
      passwordHash: "",
      firstName: preview.firstName || "Alexander",
      lastName: preview.lastName || "Hamilton",
      phone: "+1 (555) 019-2834",
      addressLine1: "742 Evergreen Terrace",
      city: "New York",
      state: "NY",
      postalCode: "10001",
      theme: preview.theme || "fernway-ember",
      disabledAt: null,
      createdAt: new Date(),
    };
  }

  return null;
}

type CookieStore = Awaited<ReturnType<typeof cookies>>;

/** Readable by the page's JavaScript on purpose: it is echoed back in the X-CSRFToken header. */
export function issueCsrfCookie(store: CookieStore): string {
  const token = randomBytes(24).toString("base64url");
  store.set(CSRF_COOKIE, token, { httpOnly: false, secure: isProduction, sameSite: "lax", path: "/" });
  return token;
}
