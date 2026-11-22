import { billInputSchema } from "@/schemas/admin";
import { handler, parseBody, requireAdmin } from "@/server/http";
import { getCustomer } from "@/server/selectors/admin";
import { addBill } from "@/server/services/ledger";

export const POST = handler(async (request, context: RouteContext<"/api/admin/customers/[id]/bills">) => {
  await requireAdmin();
  const { id } = await context.params;
  await addBill(id, await parseBody(request, billInputSchema));
  return getCustomer(id);
});
