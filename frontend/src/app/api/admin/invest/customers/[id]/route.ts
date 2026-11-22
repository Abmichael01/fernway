import { z } from "zod";
import { adminInvestCustomerUpdateSchema } from "@/schemas/invest";
import { handler, HttpError, parseBody, requireAdmin } from "@/server/http";
import { adminCustomer, adminCustomerDetail } from "@/server/selectors/invest";
import { updateInvestCustomer } from "@/server/services/invest-admin";

type Context = RouteContext<"/api/admin/invest/customers/[id]">;

async function customerId(context: Context): Promise<string> {
  const { id } = await context.params;
  if (!z.uuid().safeParse(id).success) throw new HttpError(404, "That customer doesn't exist.");
  return id;
}

export const GET = handler(async (_request, context: Context) => {
  await requireAdmin();
  const detail = await adminCustomerDetail(await customerId(context));
  if (!detail) throw new HttpError(404, "That customer doesn't exist.");
  return detail;
});

export const PATCH = handler(async (request, context: Context) => {
  await requireAdmin();
  const id = await customerId(context);
  const input = await parseBody(request, adminInvestCustomerUpdateSchema);
  await updateInvestCustomer(id, input);
  return adminCustomer(id);
});
