import { handler, HttpError, requireUser } from "@/server/http";
import { findBank } from "@/server/services/banks";

/** GET /api/banks?routing=021000021 → the bank's name, or 404. */
export const GET = handler(async (request) => {
  await requireUser();
  const routingNumber = new URL(request.url).searchParams.get("routing")?.trim() ?? "";
  const bankName = findBank(routingNumber);
  if (!bankName) throw new HttpError(404, "We couldn't find a bank with that routing number. Check it and try again.");
  return { routingNumber, bankName };
});
