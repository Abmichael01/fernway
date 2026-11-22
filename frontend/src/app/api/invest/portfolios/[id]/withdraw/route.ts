import { z } from "zod";
import { portfolioWithdrawInputSchema } from "@/schemas/invest";
import { handler, HttpError, parseBody, requireInvestUser } from "@/server/http";
import { transactionById } from "@/server/selectors/invest";
import { withdrawFromPortfolio } from "@/server/services/invest";

export const POST = handler(async (request, { params }: RouteContext<"/api/invest/portfolios/[id]/withdraw">) => {
  const user = await requireInvestUser();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) throw new HttpError(404, "That portfolio isn't available.");
  const body = await parseBody(request, portfolioWithdrawInputSchema);
  const entry = await withdrawFromPortfolio(user.id, id, "all" in body ? "all" : body.amount);
  return transactionById(user.id, entry.id);
});
