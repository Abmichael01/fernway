import { directTradeInputSchema } from "@/schemas/invest";
import { handler, parseBody, requireInvestUser } from "@/server/http";
import { transactionById } from "@/server/selectors/invest";
import { placeDirectTrade } from "@/server/services/invest";

export const POST = handler(async (request) => {
  const user = await requireInvestUser();
  const input = await parseBody(request, directTradeInputSchema);
  const entry = await placeDirectTrade(user.id, input);
  return transactionById(user.id, entry.id);
});
