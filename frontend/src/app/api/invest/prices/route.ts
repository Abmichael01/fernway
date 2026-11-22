import { handler, requireInvestUser } from "@/server/http";
import { marketPrices } from "@/server/selectors/invest";

export const GET = handler(async () => {
  await requireInvestUser();
  return marketPrices();
});
