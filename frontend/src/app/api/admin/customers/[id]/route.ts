import { customerUpdateSchema } from "@/schemas/admin";
import { handler, parseBody, requireAdmin } from "@/server/http";
import { getCustomer } from "@/server/selectors/admin";
import { updateCustomer } from "@/server/services/customer";

type Context = RouteContext<"/api/admin/customers/[id]">;

export const GET = handler(async (_request, context: Context) => {
  await requireAdmin();
  return getCustomer((await context.params).id);
});

export const PATCH = handler(async (request, context: Context) => {
  await requireAdmin();
  const { id } = await context.params;
  await updateCustomer(id, await parseBody(request, customerUpdateSchema));
  return getCustomer(id);
});
