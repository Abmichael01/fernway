import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { siteSettings } from "@/server/db/schema";
import type { SiteSettings } from "@/types/banking";

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const [row] = await db().select().from(siteSettings).where(eq(siteSettings.id, 1)).limit(1);
    return { supportEmail: row?.supportEmail ?? null };
  } catch {
    return { supportEmail: null };
  }
}
