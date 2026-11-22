import { adminPortfolioSchema } from "@/schemas/invest";
import { handler, parseBody, requireAdmin } from "@/server/http";
import { adminPortfolio, adminPortfolios } from "@/server/selectors/invest";
import { createPortfolio } from "@/server/services/invest-admin";

export const GET = handler(async () => {
  await requireAdmin();
  return adminPortfolios();
});

export const POST = handler(async (request) => {
  const admin = await requireAdmin();
  const input = await parseBody(request, adminPortfolioSchema);
  const id = await createPortfolio(input, admin.id);
  return Response.json(await adminPortfolio(id), { status: 201 });
});
