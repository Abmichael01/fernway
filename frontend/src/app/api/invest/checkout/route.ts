import { z } from "zod";
import { MAX_TRADE, MIN_TRADE } from "@/lib/invest";
import { handler, parseBody, requireInvestUser } from "@/server/http";
import { createBuyCheckout } from "@/server/services/invest";

const checkoutSchema = z.object({
  amount: z.number().int().min(MIN_TRADE).max(MAX_TRADE),
  description: z.string().trim().min(1).max(160),
});

/** Prepares a BEP-20 USD (CryptAPI) payment address for an investment or coin purchase. */
export const POST = handler(async (request) => {
  const user = await requireInvestUser();
  const input = await parseBody(request, checkoutSchema);
  return createBuyCheckout(user.id, input);
});
