import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { LOCAL_QUICK_SIGN_IN } from "@/config/features";
import { createSession } from "@/server/auth/session";
import { db } from "@/server/db/client";
import { users } from "@/server/db/schema";
import { handler, HttpError, parseBody } from "@/server/http";
import { toUser } from "@/server/mappers";

const schema = z.object({
  email: z.string().email(),
});

const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

/** True only when the request was made to this computer itself (not over the network). */
function isLoopbackRequest(request: Request): boolean {
  const host = request.headers.get("host") ?? "";
  const hostname = host.startsWith("[") ? host.slice(0, host.indexOf("]") + 1) : host.split(":")[0];
  return LOOPBACK_HOSTS.has(hostname.toLowerCase());
}

/**
 * Local-only passwordless sign-in for development on loopback hosts. Excluded from production
 * builds and restricted to localhost requests in development.
 */
export const POST = handler(async (request) => {
  if (!LOCAL_QUICK_SIGN_IN || !isLoopbackRequest(request)) {
    throw new HttpError(404, "Not found.");
  }

  const { email } = await parseBody(request, schema);
  const [user] = await db()
    .select()
    .from(users)
    .where(and(eq(users.email, email.toLowerCase().trim()), isNull(users.disabledAt)))
    .limit(1);

  if (!user) {
    throw new HttpError(404, "No active account with that email.");
  }

  await createSession(user.id);
  return toUser(user);
});
