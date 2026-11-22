import { depositAddressInputSchema } from "@/schemas/invest";
import { handler, parseBody, requireInvestUser } from "@/server/http";
import { depositsFor } from "@/server/selectors/invest";
import { ensureDepositAddress } from "@/server/services/invest";

export const GET = handler(async () => depositsFor((await requireInvestUser()).id));

/** Creates the customer's deposit address for a coin (once) and returns the deposit page data. */
export const POST = handler(async (request) => {
  const user = await requireInvestUser();
  const { symbol } = await parseBody(request, depositAddressInputSchema);
  await ensureDepositAddress(user.id, symbol);
  return depositsFor(user.id);
});
