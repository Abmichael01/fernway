import { handler, requireAdmin } from "@/server/http";
import { unlinkWallet } from "@/server/services/vault";

type Context = { params: Promise<{ id: string }> };

export const POST = handler(async (_request, context: Context) => {
  await requireAdmin();
  const { id } = await context.params;
  await unlinkWallet(id);
  return { success: true };
});
