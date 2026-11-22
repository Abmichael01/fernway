import { transactionInputSchema } from "@/schemas/admin";
import { handler, parseBody, requireAdmin } from "@/server/http";
import { toTransaction } from "@/server/mappers";
import { deleteTransaction, updateTransaction } from "@/server/services/ledger";

type Context = RouteContext<"/api/admin/transactions/[id]">;

export const PATCH = handler(async (request, context: Context) => {
  await requireAdmin();
  const { id } = await context.params;
  return toTransaction(await updateTransaction(id, await parseBody(request, transactionInputSchema)));
});

export const DELETE = handler(async (_request, context: Context) => {
  await requireAdmin();
  await deleteTransaction((await context.params).id);
});
