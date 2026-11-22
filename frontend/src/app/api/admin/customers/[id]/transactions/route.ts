import { z } from "zod";
import { handler, HttpError, requireAdmin } from "@/server/http";
import { getCustomer } from "@/server/selectors/admin";
import { transactionsForUser } from "@/server/selectors/banking";

const querySchema = z.object({ accountId: z.uuid().optional() });

export const GET = handler(async (request, context: RouteContext<"/api/admin/customers/[id]/transactions">) => {
  await requireAdmin();
  const { id } = await context.params;
  const query = querySchema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!query.success) throw new HttpError(400, "That account filter isn't valid.");
  await getCustomer(id);
  return transactionsForUser(id, query.data);
});
