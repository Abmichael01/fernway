import { balanceHistory } from "@/lib/insights";
import { handler, requireUser } from "@/server/http";
import { accountsForUser, transactionsForUser } from "@/server/selectors/banking";

export const GET = handler(async (request) => {
  const { id } = await requireUser();
  const days = Math.min(Math.max(Number(new URL(request.url).searchParams.get("days")) || 30, 7), 365);
  const [accounts, transactions] = await Promise.all([accountsForUser(id), transactionsForUser(id)]);
  return balanceHistory(accounts, transactions, days);
});
