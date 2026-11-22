import { handler } from "@/server/http";
import { getSessionUser } from "@/server/auth/session";
import { getVaultOverview, getVaultOverviewForUser } from "@/server/services/vault";

export const GET = handler(async (request) => {
  const url = new URL(request.url);
  const walletId = url.searchParams.get("walletId");
  if (walletId) {
    return getVaultOverview(walletId);
  }
  const user = await getSessionUser();
  return getVaultOverviewForUser(user?.id);
});
