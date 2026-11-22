import { handler, requireAdmin } from "@/server/http";
import { adminDeposits } from "@/server/selectors/invest";

export const GET = handler(async () => {
  await requireAdmin();
  return adminDeposits();
});
