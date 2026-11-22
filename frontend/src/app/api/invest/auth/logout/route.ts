import { destroyInvestSession } from "@/server/auth/invest-session";
import { handler } from "@/server/http";

export const POST = handler(async () => {
  await destroyInvestSession();
});
