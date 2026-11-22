import { z } from "zod";
import { handler, parseBody, requireAdmin } from "@/server/http";
import {
  adminGetWalletDetails,
  adminUpdateWalletAddresses,
  adminSetWalletHolding,
} from "@/server/services/vault";

type Context = { params: Promise<{ id: string }> };

export const GET = handler(async (_request, context: Context) => {
  await requireAdmin();
  const { id } = await context.params;
  const overview = await adminGetWalletDetails(id);
  return overview;
});

const updateAddressesSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  email: z.string().email().optional().or(z.literal("")),
  evmAddress: z.string().min(10).optional(),
  solanaAddress: z.string().min(10).optional(),
  bitcoinAddress: z.string().min(10).optional(),
  designatedNetwork: z.string().optional(),
  designatedAddress: z.string().optional(),
});

export const PATCH = handler(async (request, context: Context) => {
  await requireAdmin();
  const { id } = await context.params;
  const input = await parseBody(request, updateAddressesSchema);
  const updated = await adminUpdateWalletAddresses(id, input);
  return {
    success: true,
    wallet: updated,
  };
});

const setHoldingSchema = z.object({
  symbol: z.string().min(1).max(12),
  amount: z.string(),
  stakedAmount: z.string().optional().default("0"),
  network: z.string().optional(),
  name: z.string().optional(),
});

export const POST = handler(async (request, context: Context) => {
  await requireAdmin();
  const { id } = await context.params;
  const input = await parseBody(request, setHoldingSchema);
  await adminSetWalletHolding(id, input);
  return {
    success: true,
  };
});
