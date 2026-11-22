import { destroySession } from "@/server/auth/session";
import { handler } from "@/server/http";

export const POST = handler(async () => {
  await destroySession();
});
