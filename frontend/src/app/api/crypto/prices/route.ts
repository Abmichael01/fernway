import { z } from "zod";
import { priceRangeSchema } from "@/schemas/trade";
import { handler, HttpError, requireUser } from "@/server/http";
import { getHistory, RANGE_DAYS } from "@/server/services/prices";

const querySchema = z.object({ symbol: z.enum(["BTC", "ETH", "SOL", "USDC"]), range: priceRangeSchema });

/** GET /api/crypto/prices?symbol=BTC&range=1M → price points, oldest first. */
export const GET = handler(async (request) => {
  await requireUser();
  const query = querySchema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!query.success) throw new HttpError(400, "Choose a coin and a time range.");
  return getHistory(query.data.symbol, RANGE_DAYS[query.data.range]);
});
