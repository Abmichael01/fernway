import { z } from "zod";
import { handler, parseBody } from "@/server/http";
import { syncWalletOnChain } from "@/server/services/onchain";
import { getOrCreateDefaultStandaloneWallet } from "@/server/services/vault";

const syncSchema = z.object({
  walletId: z.string().optional(),
});

export const POST = handler(async (request) => {
  const input = await parseBody(request, syncSchema);

  let targetWalletId = input.walletId;
  if (!targetWalletId) {
    const defaultWallet = await getOrCreateDefaultStandaloneWallet();
    targetWalletId = defaultWallet.id;
  }

  const result = await syncWalletOnChain(targetWalletId);
  return result;
});
