import { cashFlow } from "@/lib/insights";
import { handler, requireUser } from "@/server/http";
import { transactionsForUser } from "@/server/selectors/banking";

export const GET = handler(async (request) => {
  const weeks = Math.min(Math.max(Number(new URL(request.url).searchParams.get("weeks")) || 8, 4), 52);
  return cashFlow(await transactionsForUser((await requireUser()).id), weeks);
});
