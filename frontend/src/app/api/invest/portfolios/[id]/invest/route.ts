import { z } from "zod";
import { portfolioInvestInputSchema } from "@/schemas/invest";
import { handler, HttpError, parseBody, requireInvestUser } from "@/server/http";
import { transactionById } from "@/server/selectors/invest";
import { investInPortfolio } from "@/server/services/invest";

export const POST = handler(async (request, { params }: RouteContext<"/api/invest/portfolios/[id]/invest">) => {
  const user = await requireInvestUser();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) throw new HttpError(404, "That portfolio isn't available.");
  const { amount } = await parseBody(request, portfolioInvestInputSchema);
  const entry = await investInPortfolio(user.id, id, amount);
  return transactionById(user.id, entry.id);
});
