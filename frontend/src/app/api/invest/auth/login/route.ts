import { eq } from "drizzle-orm";
import { investLoginInputSchema } from "@/schemas/invest";
import { createInvestSession } from "@/server/auth/invest-session";
import { verifyPassword } from "@/server/auth/password";
import { db } from "@/server/db/client";
import { investUsers } from "@/server/db/schema";
import { handler, HttpError, parseBody } from "@/server/http";
import { toInvestUser } from "@/server/selectors/invest";
import { clearThrottle, DECOY_HASH, throttle } from "@/server/services/auth";

/** Fernway Invest sign-in. Separate accounts and cookie from Banking. */
export const POST = handler(async (request) => {
  const { email, password } = await parseBody(request, investLoginInputSchema);
  const normalized = email.trim().toLowerCase();
  const clientKey = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const key = `invest|${clientKey}|${normalized}`;
  throttle(key);

  const [user] = await db().select().from(investUsers).where(eq(investUsers.email, normalized)).limit(1);
  const valid = await verifyPassword(password, user?.passwordHash ?? DECOY_HASH);
  if (!user || !valid) {
    throw new HttpError(401, "That email and password don't match.", { password: "That email and password don't match." });
  }
  if (user.disabledAt) throw new HttpError(403, "This account is closed.");
  clearThrottle(key);
  await createInvestSession(user.id);
  return toInvestUser(user);
});
