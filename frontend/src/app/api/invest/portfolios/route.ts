import { handler, requireInvestUser } from "@/server/http";
import { publishedPortfolios } from "@/server/selectors/invest";

export const GET = handler(async () => {
  await requireInvestUser();
  return publishedPortfolios();
});
