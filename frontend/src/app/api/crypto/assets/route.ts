import { handler, requireUser } from "@/server/http";
import { assetsForUser } from "@/server/selectors/crypto";

export const GET = handler(async () => assetsForUser((await requireUser()).id));
