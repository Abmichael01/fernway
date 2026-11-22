import { handler, requireUser } from "@/server/http";
import { accountsForUser } from "@/server/selectors/banking";

export const GET = handler(async () => accountsForUser((await requireUser()).id));
