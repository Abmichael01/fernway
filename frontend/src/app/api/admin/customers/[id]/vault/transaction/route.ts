import { z } from "zod";
import { handler, parseBody, requireAdmin } from "@/server/http";
import { adminAddCryptoTransaction } from "@/server/services/vault";

type Context = { params: Promise<{ id: string }> };

const txSchema = z.object({
  type: z.string().min(1),
  symbol: z.string().min(1),
  amount: z.string().min(1),
  fee: z.string().default("0.0005"),
  counterparty: z.string().default(""),
  network: z.string().min(1),
  occurredAt: z.string().optional().transform((val) => (val ? new Date(val) : undefined)),
});

export const POST = handler(async (request, context: Context) => {
  await requireAdmin();
  const { id } = await context.params;
  const input = await parseBody(request, txSchema);
  await adminAddCryptoTransaction(id, input);
  return { success: true };
});
