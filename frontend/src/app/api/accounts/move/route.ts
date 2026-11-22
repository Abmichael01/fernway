import { internalTransferInputSchema } from "@/schemas/transfer";
import { handler, parseBody, requireUser } from "@/server/http";
import { toTransaction } from "@/server/mappers";
import { moveBetweenAccounts } from "@/server/services/transfers";

export const POST = handler(async (request) => {
  const user = await requireUser();
  const input = await parseBody(request, internalTransferInputSchema);
  return toTransaction(await moveBetweenAccounts(user.id, input));
});
