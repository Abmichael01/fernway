import { handler, requireInvestUser } from "@/server/http";
import { transactionsFor } from "@/server/selectors/invest";

export const GET = handler(async () => transactionsFor((await requireInvestUser()).id));
