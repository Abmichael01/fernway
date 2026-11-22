import { accountOpenSchema } from "@/schemas/admin";
import { handler, parseBody, requireAdmin } from "@/server/http";
import { getCustomer } from "@/server/selectors/admin";
import { openAccount } from "@/server/services/ledger";

export const POST = handler(async (request, context: RouteContext<"/api/admin/customers/[id]/accounts">) => {
  await requireAdmin();
  const { id } = await context.params;
  await openAccount(id, await parseBody(request, accountOpenSchema));
  return getCustomer(id);
});
