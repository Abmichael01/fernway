import { handler, requireInvestUser } from "@/server/http";
import { toInvestUser } from "@/server/selectors/invest";

export const GET = handler(async () => toInvestUser(await requireInvestUser()));
