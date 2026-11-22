import { z } from "zod";
import { handler, parseBody } from "@/server/http";
import { getSessionUser } from "@/server/auth/session";
import { stakeCrypto } from "@/server/services/vault";

const stakeSchema = z.object({
  symbol: z.string().min(1),
  amount: z.number().positive(),
  validator: z.string().min(1),
  network: z.string().min(1),
});

export const POST = handler(async (request) => {
  const user = await getSessionUser();
  const input = await parseBody(request, stakeSchema);
  return stakeCrypto(user?.id, input);
});
