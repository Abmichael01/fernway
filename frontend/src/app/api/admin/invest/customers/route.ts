import { adminInvestCustomerCreateSchema } from "@/schemas/invest";
import { handler, parseBody, requireAdmin } from "@/server/http";
import { adminCustomer, adminCustomers } from "@/server/selectors/invest";
import { createInvestCustomer } from "@/server/services/invest-admin";

export const GET = handler(async () => {
  await requireAdmin();
  return adminCustomers();
});

export const POST = handler(async (request) => {
  const admin = await requireAdmin();
  const input = await parseBody(request, adminInvestCustomerCreateSchema);
  const row = await createInvestCustomer(input, admin.id);
  return Response.json(await adminCustomer(row.id), { status: 201 });
});
