import { monthSummary } from "@/lib/insights";
import { handler, requireUser } from "@/server/http";
import { transactionsForUser } from "@/server/selectors/banking";

export const GET = handler(async () => monthSummary(await transactionsForUser((await requireUser()).id)));
