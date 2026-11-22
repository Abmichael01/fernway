import { priceRangeSchema } from "@/schemas/trade";
import { handler, HttpError, requireUser } from "@/server/http";
import { portfolioHistory } from "@/server/selectors/crypto";

export const GET = handler(async (request) => {
  const user = await requireUser();
  const range = priceRangeSchema.safeParse(new URL(request.url).searchParams.get("range"));
  if (!range.success) throw new HttpError(400, "Choose a time range.");
  return portfolioHistory(user.id, range.data);
});
