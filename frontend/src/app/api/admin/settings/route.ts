import { siteSettingsSchema } from "@/schemas/settings";
import { handler, parseBody, requireAdmin } from "@/server/http";
import { getSiteSettings } from "@/server/selectors/settings";
import { updateSiteSettings } from "@/server/services/settings";

export const GET = handler(async () => {
  await requireAdmin();
  return getSiteSettings();
});

export const PATCH = handler(async (request) => {
  const admin = await requireAdmin();
  const input = await parseBody(request, siteSettingsSchema);
  return updateSiteSettings(input, admin.id);
});
