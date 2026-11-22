import { z } from "zod";
import { handler, parseBody, requireAdmin } from "@/server/http";
import { listAllAdminVaultWallets, createStandaloneVaultWallet } from "@/server/services/vault";

export const GET = handler(async () => {
  await requireAdmin();
  const wallets = await listAllAdminVaultWallets();
  return { wallets };
});

const createSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
});

export const POST = handler(async (request) => {
  await requireAdmin();
  const input = await parseBody(request, createSchema);
  await createStandaloneVaultWallet({
    name: input.name,
    email: input.email || undefined,
    seedInitialAssets: true,
  });
  return { success: true };
});
