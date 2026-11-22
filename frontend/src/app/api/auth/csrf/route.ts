import { cookies } from "next/headers";
import { issueCsrfCookie } from "@/server/auth/session";
import { handler } from "@/server/http";

/** Sets the CSRF cookie the client echoes in X-CSRFToken on unsafe requests. */
export const GET = handler(async () => {
  issueCsrfCookie(await cookies());
});
