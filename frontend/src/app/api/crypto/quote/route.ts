import { MIN_TRADE, quoteTrade } from "@/lib/trades";
import { tradeQuoteQuerySchema } from "@/schemas/trade";
import { handler, HttpError, requireUser } from "@/server/http";
import { livePrices } from "@/server/services/trading";

export const GET = handler(async (request) => {
  await requireUser();
  const query = tradeQuoteQuerySchema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!query.success) throw new HttpError(400, "That quote request isn't valid.");
  const { side, symbol, amount } = query.data;
  if (amount < MIN_TRADE) throw new HttpError(422, "Trade too small.", { amount: "The minimum trade is $10." });
  const price = (await livePrices())[symbol].price;
  return quoteTrade(side, symbol, amount, price);
});
