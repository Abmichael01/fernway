import "server-only";
import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { unstable_rethrow } from "next/navigation";
import { z } from "zod";
import { getInvestSessionUser } from "@/server/auth/invest-session";
import { CSRF_COOKIE, getSessionUser } from "@/server/auth/session";
import type { InvestUserRow, UserRow } from "@/server/db/schema";

/**
 * Shared plumbing for Route Handlers: one error shape, CSRF checks on unsafe methods,
 * and role checks. Errors match what `src/api/client.ts` expects: `{ detail, errors }`.
 */
export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly errors: Record<string, string> = {},
  ) {
    super(message);
  }
}

const UNSAFE = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/** Origins allowed to send unsafe requests, besides the app's own origin. */
const TRUSTED_ORIGINS = new Set(
  (process.env.TRUSTED_ORIGINS ?? "http://localhost:4729,http://127.0.0.1:4729")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
);

function sameToken(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

function resolveOwnOrigins(request: Request): Set<string> {
  const origins = new Set<string>([new URL(request.url).origin]);
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || request.headers.get("host")?.trim();
  if (host) {
    const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
    const proto = forwardedProto || new URL(request.url).protocol.replace(":", "");
    origins.add(`${proto}://${host}`);
  }
  return origins;
}

/** Double-submit CSRF check plus an Origin check for unsafe requests. */
async function assertCsrf(request: Request): Promise<void> {
  if (!UNSAFE.has(request.method)) return;
  const origin = request.headers.get("origin");
  const ownOrigins = resolveOwnOrigins(request);
  if (origin && !ownOrigins.has(origin) && !TRUSTED_ORIGINS.has(origin)) {
    throw new HttpError(403, "This request came from a site we don't trust.");
  }
  const cookie = (await cookies()).get(CSRF_COOKIE)?.value;
  const header = request.headers.get("x-csrftoken");
  if (!cookie || !header || !sameToken(cookie, header)) {
    throw new HttpError(403, "Your session check failed. Refresh the page and try again.");
  }
}

export async function requireUser(): Promise<UserRow> {
  const user = await getSessionUser();
  if (!user) throw new HttpError(401, "Sign in to continue.");
  return user;
}

export async function requireAdmin(): Promise<UserRow> {
  const user = await requireUser();
  if (user.role !== "admin") throw new HttpError(403, "You don't have access to the admin.");
  return user;
}

/** The signed-in Fernway Invest customer (a separate sign-in from Banking). */
export async function requireInvestUser(): Promise<InvestUserRow> {
  const user = await getInvestSessionUser();
  if (!user) throw new HttpError(401, "Sign in to continue.");
  return user;
}

/** Parses a JSON body with a Zod schema; failures become field-keyed 422 errors. */
export async function parseBody<T extends z.ZodType>(request: Request, schema: T): Promise<z.infer<T>> {
  const body = await request.json().catch(() => {
    throw new HttpError(400, "The request body must be JSON.");
  });
  const result = schema.safeParse(body);
  if (!result.success) {
    const errors: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const key = issue.path.join(".") || "form";
      errors[key] ??= issue.message;
    }
    throw new HttpError(422, "Check the highlighted fields.", errors);
  }
  return result.data;
}

/**
 * Wraps a Route Handler: CSRF on unsafe methods, JSON responses, and safe error output.
 * Unexpected errors are logged and returned as a generic 500.
 */
export function handler<Context>(fn: (request: Request, context: Context) => Promise<unknown>) {
  return async (request: Request, context: Context): Promise<Response> => {
    try {
      await assertCsrf(request);
      const result = await fn(request, context);
      if (result instanceof Response) return result;
      if (result === undefined) return new Response(null, { status: 204 });
      return Response.json(result);
    } catch (error) {
      // Let Next.js handle its own signals (e.g. "this route is dynamic" during the build).
      unstable_rethrow(error);
      if (error instanceof HttpError) {
        return Response.json({ detail: error.message, errors: error.errors }, { status: error.status });
      }
      console.error(error);
      return Response.json({ detail: "Something went wrong on our side. Try again." }, { status: 500 });
    }
  };
}
