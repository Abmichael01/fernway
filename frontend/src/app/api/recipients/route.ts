import { handler, requireUser } from "@/server/http";
import { recipientsForUser } from "@/server/selectors/crypto";

export const GET = handler(async () => recipientsForUser((await requireUser()).id));
