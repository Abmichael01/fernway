import { z } from "zod";
import { handler, HttpError, requireInvestUser } from "@/server/http";
import { portfolioForCustomer } from "@/server/selectors/invest";

export const GET = handler(async (_request, { params }: RouteContext<"/api/invest/portfolios/[id]">) => {
  const user = await requireInvestUser();
  const { id } = await params;
  const portfolio = z.uuid().safeParse(id).success ? await portfolioForCustomer(user.id, id) : null;
  if (!portfolio) throw new HttpError(404, "That portfolio isn't available.");
  return portfolio;
});
