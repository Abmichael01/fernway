import { withdrawalInputSchema } from "@/schemas/invest";
import { handler, parseBody, requireInvestUser } from "@/server/http";
import { withdrawalById, withdrawalsFor } from "@/server/selectors/invest";
import { requestWithdrawal } from "@/server/services/invest";

export const GET = handler(async () => withdrawalsFor((await requireInvestUser()).id));

export const POST = handler(async (request) => {
  const user = await requireInvestUser();
  const input = await parseBody(request, withdrawalInputSchema);
  const withdrawal = await requestWithdrawal(user.id, input);
  return withdrawalById(withdrawal.id);
});
