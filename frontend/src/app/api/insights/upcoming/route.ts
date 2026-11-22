import { upcomingPayments } from "@/lib/insights";
import { handler, requireUser } from "@/server/http";
import { billsForUser } from "@/server/selectors/banking";

export const GET = handler(async () => upcomingPayments(await billsForUser((await requireUser()).id)).slice(0, 5));
