import { z } from "zod";
import { handler, HttpError, requireAdmin } from "@/server/http";
import { adminWithdrawals } from "@/server/selectors/invest";

const status = z.enum(["requested", "paid", "rejected", "cancelled"]).optional();

export const GET = handler(async (request) => {
  await requireAdmin();
  const parsed = status.safeParse(new URL(request.url).searchParams.get("status") ?? undefined);
  if (!parsed.success) throw new HttpError(422, "Unknown status.");
  return adminWithdrawals(parsed.data);
});
