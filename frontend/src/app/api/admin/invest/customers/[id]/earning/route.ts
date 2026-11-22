import { z } from "zod";
import { adminRecordEarningSchema } from "@/schemas/invest";
import { handler, HttpError, parseBody, requireAdmin } from "@/server/http";
import { overviewFor } from "@/server/selectors/invest";
import { recordDailyEarning } from "@/server/services/invest-admin";

type Context = RouteContext<"/api/admin/invest/customers/[id]/earning">;

export const POST = handler(async (request, context: Context) => {
  await requireAdmin();
  const { id } = await context.params;
  if (!z.uuid().safeParse(id).success) throw new HttpError(404, "That customer doesn't exist.");
  const input = await parseBody(request, adminRecordEarningSchema);
  await recordDailyEarning(id, input);
  return overviewFor(id);
});
