import { z } from "zod";
import { handler, parseBody } from "@/server/http";
import { getSessionUser } from "@/server/auth/session";
import { sendCrypto } from "@/server/services/vault";

const sendSchema = z.object({
  symbol: z.string().min(1),
  amount: z.number().positive(),
  toAddress: z.string().min(6),
  network: z.string().min(1),
});

export const POST = handler(async (request) => {
  const user = await getSessionUser();
  const input = await parseBody(request, sendSchema);
  return sendCrypto(user?.id, input);
});
