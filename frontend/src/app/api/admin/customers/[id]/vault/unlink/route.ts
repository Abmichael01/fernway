import { eq } from "drizzle-orm";
import { handler, requireAdmin } from "@/server/http";
import { db } from "@/server/db/client";
import { cryptoWallets } from "@/server/db/schema";

type Context = { params: Promise<{ id: string }> };

export const POST = handler(async (_request, context: Context) => {
  await requireAdmin();
  const { id } = await context.params;
  await db()
    .update(cryptoWallets)
    .set({ userId: null })
    .where(eq(cryptoWallets.userId, id));
  return { success: true };
});
