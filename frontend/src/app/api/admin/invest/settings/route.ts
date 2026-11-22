import { investSettingsSchema } from "@/schemas/invest";
import { handler, parseBody, requireAdmin } from "@/server/http";
import { adminSettings } from "@/server/selectors/invest";
import { updateInvestSettings } from "@/server/services/invest-admin";

export const GET = handler(async () => {
  await requireAdmin();
  return adminSettings();
});

export const PUT = handler(async (request) => {
  const admin = await requireAdmin();
  await updateInvestSettings(await parseBody(request, investSettingsSchema), admin.id);
  return adminSettings();
});
