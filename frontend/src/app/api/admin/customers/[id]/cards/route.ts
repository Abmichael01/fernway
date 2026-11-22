import { cardIssueSchema } from "@/schemas/admin";
import { handler, parseBody, requireAdmin } from "@/server/http";
import { getCustomer } from "@/server/selectors/admin";
import { issueCard } from "@/server/services/ledger";

export const POST = handler(async (request, context: RouteContext<"/api/admin/customers/[id]/cards">) => {
  await requireAdmin();
  const { id } = await context.params;
  await issueCard(id, await parseBody(request, cardIssueSchema));
  return getCustomer(id);
});
