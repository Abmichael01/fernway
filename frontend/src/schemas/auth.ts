import { z } from "zod";

export const signInSchema = z.object({
  email: z.email("Enter the email address on your account."),
  password: z.string().min(8, "Your password has at least 8 characters."),
});

export type SignInValues = z.infer<typeof signInSchema>;
