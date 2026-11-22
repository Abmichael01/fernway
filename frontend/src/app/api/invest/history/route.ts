import { priceRangeSchema } from "@/schemas/trade";
import { handler, HttpError, requireInvestUser } from "@/server/http";
import { historyFor } from "@/server/selectors/invest";

export const GET = handler(async (request) => {
  const user = await requireInvestUser();
  const range = priceRangeSchema.safeParse(new URL(request.url).searchParams.get("range") ?? "1M");
  if (!range.success) throw new HttpError(422, "Choose 1W, 1M, 3M or 1Y.");
  return historyFor(user.id, range.data);
});
