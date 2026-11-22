import { handler, requireUser } from "@/server/http";
import { toUser } from "@/server/mappers";

export const GET = handler(async () => toUser(await requireUser()));
