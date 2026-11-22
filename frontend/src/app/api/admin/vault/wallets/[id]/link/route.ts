import { z } from "zod";
import { handler, parseBody, requireAdmin } from "@/server/http";
import { linkWalletToCustomer } from "@/server/services/vault";

type Context = { params: Promise<{ id: string }> };

const linkSchema = z.object({
  customerId: z.string().uuid(),
});

export const POST = handler(async (request, context: Context) => {
  await requireAdmin();
  const { id } = await context.params;
  const input = await parseBody(request, linkSchema);
  await linkWalletToCustomer(id, input.customerId);
  return { success: true };
});
