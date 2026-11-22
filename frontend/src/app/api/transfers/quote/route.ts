import { quoteTransfer } from "@/lib/transfers";
import { transferQuoteQuerySchema } from "@/schemas/transfer";
import { handler, HttpError, requireUser } from "@/server/http";

export const GET = handler(async (request) => {
  await requireUser();
  const query = transferQuoteQuerySchema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!query.success) throw new HttpError(400, "That quote request isn't valid.");
  return quoteTransfer(query.data.method, query.data.amount, new Date());
});
