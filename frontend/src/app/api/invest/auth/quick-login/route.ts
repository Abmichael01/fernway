import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { LOCAL_QUICK_SIGN_IN } from "@/config/features";
import { createInvestSession } from "@/server/auth/invest-session";
import { db } from "@/server/db/client";
import { investUsers } from "@/server/db/schema";
import { handler, HttpError, parseBody } from "@/server/http";
import { toInvestUser } from "@/server/selectors/invest";

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
 * Local-only passwordless sign-in for Fernway Invest. Excluded in production builds and
 * restricted to loopback requests in development.
 */
export const POST = handler(async (request) => {
  if (!LOCAL_QUICK_SIGN_IN || !isLoopbackRequest(request)) {
    throw new HttpError(404, "Not found.");
  }

  const { email } = await parseBody(request, schema);
  const [user] = await db()
    .select()
    .from(investUsers)
    .where(and(eq(investUsers.email, email.toLowerCase().trim()), isNull(investUsers.disabledAt)))
    .limit(1);

  if (!user) {
    throw new HttpError(404, "No active Invest account with that email.");
  }

  await createInvestSession(user.id);
  return toInvestUser(user);
});
