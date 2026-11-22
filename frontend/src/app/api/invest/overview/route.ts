import { handler, requireInvestUser } from "@/server/http";
import { overviewFor } from "@/server/selectors/invest";

export const GET = handler(async () => overviewFor((await requireInvestUser()).id));
