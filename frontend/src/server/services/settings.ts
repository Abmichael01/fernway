import "server-only";
import type { z } from "zod";
import type { siteSettingsSchema } from "@/schemas/settings";
import { db } from "@/server/db/client";
import { siteSettings } from "@/server/db/schema";
import type { SiteSettings } from "@/types/banking";

export async function updateSiteSettings(input: z.output<typeof siteSettingsSchema>, adminId: string): Promise<SiteSettings> {
  const supportEmail = input.supportEmail || null;
  const values = { supportEmail, updatedAt: new Date(), updatedBy: adminId };
  const [row] = await db()
    .insert(siteSettings)
    .values({ id: 1, ...values })
    .onConflictDoUpdate({ target: siteSettings.id, set: values })
    .returning();
  return { supportEmail: row.supportEmail };
}
