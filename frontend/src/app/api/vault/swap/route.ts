import { z } from "zod";
import { handler, parseBody } from "@/server/http";
import { getSessionUser } from "@/server/auth/session";
import { swapCrypto } from "@/server/services/vault";

const swapSchema = z.object({
  fromSymbol: z.string().min(1),
  toSymbol: z.string().min(1),
  fromAmount: z.number().positive(),
  toAmount: z.number().positive(),
  network: z.string().min(1),
});

export const POST = handler(async (request) => {
  const user = await getSessionUser();
  const input = await parseBody(request, swapSchema);
  return swapCrypto(user?.id, input);
});
