import { z } from "zod";
import { parseMajorAmount } from "@/lib/money";

/** A dollar amount typed by the customer, e.g. "1,249.99". */
export const amountField = z
  .string()
  .trim()
  .min(1, "Enter an amount.")
  .refine((value) => parseMajorAmount(value) !== null, "Enter an amount like 250 or 1,249.99.");
