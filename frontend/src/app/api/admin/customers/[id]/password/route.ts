import { z } from "zod";
import { handler, parseBody, requireAdmin } from "@/server/http";
import { setCustomerPassword } from "@/server/services/customer";

const passwordSchema = z.object({
  password: z
    .string()
    .min(10, "Use at least 10 characters.")
    .regex(/[A-Za-z]/, "Include at least one letter.")
    .regex(/\d/, "Include at least one number."),
});

export const POST = handler(async (request, context: RouteContext<"/api/admin/customers/[id]/password">) => {
  await requireAdmin();
  const { password } = await parseBody(request, passwordSchema);
  await setCustomerPassword((await context.params).id, password);
});
