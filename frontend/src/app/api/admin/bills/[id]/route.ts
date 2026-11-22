import { handler, requireAdmin } from "@/server/http";
import { getCustomer } from "@/server/selectors/admin";
import { deleteBill } from "@/server/services/ledger";

export const DELETE = handler(async (_request, context: RouteContext<"/api/admin/bills/[id]">) => {
  await requireAdmin();
  return getCustomer(await deleteBill((await context.params).id));
});
