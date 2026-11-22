import { customerCreateSchema } from "@/schemas/admin";
import { handler, parseBody, requireAdmin } from "@/server/http";
import { getCustomer, listCustomers } from "@/server/selectors/admin";
import { createCustomer } from "@/server/services/customer";

export const GET = handler(async () => {
  await requireAdmin();
  return listCustomers();
});

export const POST = handler(async (request) => {
  await requireAdmin();
  const user = await createCustomer(await parseBody(request, customerCreateSchema));
  return getCustomer(user.id);
});
