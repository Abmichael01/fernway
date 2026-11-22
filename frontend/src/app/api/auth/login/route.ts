import { signInSchema } from "@/schemas/auth";
import { handler, parseBody } from "@/server/http";
import { toUser } from "@/server/mappers";
import { signIn } from "@/server/services/auth";

export const POST = handler(async (request) => {
  const { email, password } = await parseBody(request, signInSchema);
  const clientKey = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const userAgent = request.headers.get("user-agent") || "";
  return toUser(await signIn(email, password, clientKey, userAgent));
});
