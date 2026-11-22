import { connection } from "next/server";
import { CRYPTO_NAMES, CRYPTO_SYMBOLS } from "@/lib/trades";
import { handler } from "@/server/http";
import { getSpotPrices, isLive } from "@/server/services/prices";
import type { MarketPrice } from "@/types/banking";

/**
 * Public: today's market prices for the homepage. No sign-in, no customer data.
 * Answers 503 rather than show reference prices to the public as if they were live.
 */
export const GET = handler(async () => {
  // Live prices: always answer at request time, never from a build-time snapshot.
  await connection();
  const spot = await getSpotPrices();
  if (!isLive(spot)) return Response.json({ detail: "Prices are loading. Try again in a minute.", errors: {} }, { status: 503 });
  return CRYPTO_SYMBOLS.map(
    (symbol): MarketPrice => ({ symbol, name: CRYPTO_NAMES[symbol], price: spot[symbol].price, change24h: spot[symbol].change24h }),
  );
});
