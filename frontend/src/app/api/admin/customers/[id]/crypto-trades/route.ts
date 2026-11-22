import { adminTradeInputSchema } from "@/schemas/trade";
import { handler, parseBody, requireAdmin } from "@/server/http";
import { toTransaction } from "@/server/mappers";
import { getCustomer } from "@/server/selectors/admin";
import { recordPastBuy } from "@/server/services/trading";

/** Records a past crypto buy for a customer, at the market price of that moment. */
export const POST = handler(async (request, context: RouteContext<"/api/admin/customers/[id]/crypto-trades">) => {
  const admin = await requireAdmin();
  const { id } = await context.params;
  await getCustomer(id);
  const input = await parseBody(request, adminTradeInputSchema);
  return toTransaction(await recordPastBuy(id, input, admin.id));
});
