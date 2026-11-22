import { z } from "zod";
import { investQuoteQuerySchema } from "@/schemas/invest";
import { handler, HttpError, requireInvestUser } from "@/server/http";
import { quoteFor } from "@/server/services/invest";

const symbol = z.enum(["BTC", "ETH", "SOL", "USDC"]);

/** Prices a buy or sell at live prices. `target` is a portfolio id or a coin symbol. */
export const GET = handler(async (request) => {
  const user = await requireInvestUser();
  const query = investQuoteQuerySchema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!query.success) throw new HttpError(422, "Check the amount.", { amount: "Enter an amount." });
  const { side, target, amount } = query.data;
  const coin = symbol.safeParse(target);
  if (!coin.success && !z.uuid().safeParse(target).success) throw new HttpError(404, "That isn't available.");
  return quoteFor(user.id, side, coin.success ? { symbol: coin.data } : { portfolioId: target }, amount);
});
