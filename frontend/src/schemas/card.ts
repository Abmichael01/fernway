import { z } from "zod";

export const createCardSchema = z.object({
  accountId: z.string().uuid("Please choose an account to link this card to"),
  kind: z.literal("physical"),
  label: z
    .string()
    .trim()
    .min(2, "Card nickname must be at least 2 characters")
    .max(30, "Card nickname cannot exceed 30 characters"),
  monthlyLimit: z
    .number()
    .int("Monthly limit must be whole cents")
    .min(100_00, "Minimum spending limit is $100")
    .max(1_000_000_00, "Maximum spending limit is $10,000"),
});

export type CreateCardInput = z.infer<typeof createCardSchema>;
