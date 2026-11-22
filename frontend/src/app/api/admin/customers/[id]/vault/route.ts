import { z } from "zod";
import { handler, parseBody, requireAdmin } from "@/server/http";
import { getCustomerVaultOverview, adminUpdateCustomerHolding } from "@/server/services/vault";

type Context = { params: Promise<{ id: string }> };

export const GET = handler(async (_request, context: Context) => {
  await requireAdmin();
  const { id } = await context.params;
  return getCustomerVaultOverview(id);
});

const holdingSchema = z.object({
  symbol: z.string().min(1),
  amount: z.string(),
  stakedAmount: z.string().default("0"),
  network: z.string().optional(),
});

export const POST = handler(async (request, context: Context) => {
  await requireAdmin();
  const { id } = await context.params;
  const input = await parseBody(request, holdingSchema);
  await adminUpdateCustomerHolding(id, input);
  return { success: true };
});
