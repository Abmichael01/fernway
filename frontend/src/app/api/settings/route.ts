import { connection } from "next/server";
import { handler } from "@/server/http";
import { getSiteSettings } from "@/server/selectors/settings";

/** Public: what the website needs to show, e.g. the support email. Always read at request time. */
export const GET = handler(async () => {
  await connection();
  return getSiteSettings();
});
