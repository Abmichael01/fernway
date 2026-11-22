import { transactionInputSchema } from "@/schemas/admin";
import { handler, parseBody, requireAdmin } from "@/server/http";
import { toTransaction } from "@/server/mappers";
import { addTransaction } from "@/server/services/ledger";

export const POST = handler(async (request, context: RouteContext<"/api/admin/accounts/[id]/transactions">) => {
  const admin = await requireAdmin();
  const { id } = await context.params;
  return toTransaction(await addTransaction(id, await parseBody(request, transactionInputSchema), admin.id));
});
