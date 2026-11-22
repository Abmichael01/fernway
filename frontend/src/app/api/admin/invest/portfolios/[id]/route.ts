import { z } from "zod";
import { adminPortfolioUpdateSchema } from "@/schemas/invest";
import { handler, HttpError, parseBody, requireAdmin } from "@/server/http";
import { adminPortfolio } from "@/server/selectors/invest";
import { deletePortfolio, updatePortfolio } from "@/server/services/invest-admin";

type Context = RouteContext<"/api/admin/invest/portfolios/[id]">;

async function portfolioId(context: Context): Promise<string> {
  const { id } = await context.params;
  if (!z.uuid().safeParse(id).success) throw new HttpError(404, "That portfolio doesn't exist.");
  return id;
}

export const PATCH = handler(async (request, context: Context) => {
  await requireAdmin();
  const id = await portfolioId(context);
  await updatePortfolio(id, await parseBody(request, adminPortfolioUpdateSchema));
  return adminPortfolio(id);
});

export const DELETE = handler(async (_request, context: Context) => {
  await requireAdmin();
  await deletePortfolio(await portfolioId(context));
});
