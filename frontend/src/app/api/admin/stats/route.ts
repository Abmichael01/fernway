import { handler, requireAdmin } from "@/server/http";
import { adminStats } from "@/server/selectors/admin";

export const GET = handler(async () => {
  await requireAdmin();
  return adminStats();
});
