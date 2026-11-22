import { z } from "zod";
import { handler, HttpError, requireUser } from "@/server/http";
import { transactionsForUser } from "@/server/selectors/banking";

const filtersSchema = z.object({
  accountId: z.uuid().optional(),
  direction: z.enum(["credit", "debit"]).optional(),
  category: z
    .enum(["income", "transfer", "housing", "groceries", "dining", "transport", "bills", "shopping", "entertainment", "savings", "crypto", "fees"])
    .optional(),
  search: z.string().max(80).optional(),
  limit: z.coerce.number().int().min(1).max(500).optional(),
});

export const GET = handler(async (request) => {
  const { id } = await requireUser();
  const params = Object.fromEntries(new URL(request.url).searchParams);
  const filters = filtersSchema.safeParse(params);
  if (!filters.success) throw new HttpError(400, "Those filters aren't valid.");
  return transactionsForUser(id, filters.data);
});
