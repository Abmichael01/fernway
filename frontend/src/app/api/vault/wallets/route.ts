import { z } from "zod";
import { handler, parseBody } from "@/server/http";
import { getSessionUser } from "@/server/auth/session";
import { listWalletsForActiveUser, createWalletForActiveUser } from "@/server/services/vault";

export const GET = handler(async () => {
  const user = await getSessionUser();
  const wallets = await listWalletsForActiveUser(user?.id);
  return { wallets };
});

const createWalletSchema = z.object({
  name: z.string().min(1).max(50),
  phrase: z.string().optional(),
});

export const POST = handler(async (request) => {
  const user = await getSessionUser();
  const input = await parseBody(request, createWalletSchema);
  const wallet = await createWalletForActiveUser(input.name, user?.id, input.phrase);
  return {
    wallet: {
      id: wallet.id,
      name: wallet.name,
      evmAddress: wallet.evmAddress,
      solanaAddress: wallet.solanaAddress,
      bitcoinAddress: wallet.bitcoinAddress,
    },
  };
});
