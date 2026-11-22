import { tradeInputSchema } from "@/schemas/trade";
import { handler, parseBody, requireUser } from "@/server/http";
import { toTransaction } from "@/server/mappers";
import { placeTrade } from "@/server/services/trading";

export const POST = handler(async (request) => {
  const user = await requireUser();
  const input = await parseBody(request, tradeInputSchema);
  return toTransaction(await placeTrade(user.id, input));
});
