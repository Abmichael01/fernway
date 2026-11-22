import { z } from "zod";
import { parseMajorAmount } from "@/lib/money";
import { isValidRoutingNumber } from "@/lib/routing";
import { MAX_TRANSFER, MIN_TRANSFER } from "@/lib/transfers";
import { amountField } from "./money";

const MIN_TRANSFER_MINOR = MIN_TRANSFER;

export const transferSchema = z.object({
  fromAccountId: z.string().min(1, "Choose the account to send from."),
  recipientName: z.string().trim().min(2, "Enter the name on the recipient's account.").max(80),
  routingNumber: z
    .string()
    .trim()
    .regex(/^\d{9}$/, "Routing numbers have 9 digits.")
    .refine(isValidRoutingNumber, "That isn't a valid routing number. Check it on a check or bank statement."),
  accountNumber: z
    .string()
    .trim()
    .regex(/^\d{4,17}$/, "Account numbers have 4 to 17 digits."),
  accountType: z.enum(["checking", "savings"]),
  method: z.enum(["ach", "same_day_ach", "wire"]),
  amount: amountField.refine(
    (value) => (parseMajorAmount(value) ?? 0) >= MIN_TRANSFER_MINOR,
    "The smallest transfer is $1.",
  ),
  memo: z.string().trim().max(80, "Keep the memo under 80 characters."),
  saveRecipient: z.boolean(),
});

export type TransferFormValues = z.infer<typeof transferSchema>;

export const verificationSchema = z.object({
  code: z.string().regex(/^\d{6}$/, "Enter all 6 digits."),
});

export type VerificationValues = z.infer<typeof verificationSchema>;

export const internalTransferSchema = z
  .object({
    fromAccountId: z.string().min(1, "Choose an account."),
    toAccountId: z.string().min(1, "Choose an account."),
    amount: amountField.refine((value) => (parseMajorAmount(value) ?? 0) > 0, "Enter an amount."),
  })
  .refine((values) => values.fromAccountId !== values.toAccountId, {
    message: "Choose a different account.",
    path: ["toAccountId"],
  });

export type InternalTransferValues = z.infer<typeof internalTransferSchema>;

/* API payloads (cents). The server re-checks everything the forms check. */

export const transferInputSchema = z.object({
  fromAccountId: z.uuid("Choose the account to send from."),
  recipientName: z.string().trim().min(2, "Enter the name on the recipient's account.").max(80),
  routingNumber: z
    .string()
    .trim()
    .regex(/^\d{9}$/, "Routing numbers have 9 digits.")
    .refine(isValidRoutingNumber, "That isn't a valid routing number."),
  accountNumber: z
    .string()
    .trim()
    .regex(/^\d{4,17}$/, "Account numbers have 4 to 17 digits."),
  accountType: z.enum(["checking", "savings"]),
  method: z.enum(["ach", "same_day_ach", "wire"]),
  amount: z.number().int().min(MIN_TRANSFER, "The smallest transfer is $1.").max(MAX_TRANSFER, "The largest transfer is $250,000."),
  memo: z.string().trim().max(80, "Keep the memo under 80 characters."),
  saveRecipient: z.boolean(),
  verificationCode: z.string().regex(/^\d{6}$/, "Enter all 6 digits."),
});

export const internalTransferInputSchema = z
  .object({
    fromAccountId: z.uuid("Choose an account."),
    toAccountId: z.uuid("Choose an account."),
    amount: z.number().int().positive("Enter an amount.").max(MAX_TRANSFER, "The largest transfer is $250,000."),
  })
  .refine((values) => values.fromAccountId !== values.toAccountId, {
    message: "Choose a different account.",
    path: ["toAccountId"],
  });

export const transferQuoteQuerySchema = z.object({
  method: z.enum(["ach", "same_day_ach", "wire"]),
  amount: z.coerce.number().int().min(0).max(MAX_TRANSFER),
});

/** Simplified outgoing transfer payload (in cents) reviewed & approved by the SharpToolz owner. */
export const simpleTransferInputSchema = z.object({
  recipientName: z.string().trim().min(2, "Enter the recipient's full name.").max(120),
  bankName: z.string().trim().min(2, "Enter the recipient's bank name.").max(120),
  accountNumber: z.string().trim().min(4, "Enter a valid account number.").max(64),
  routingNumber: z.string().trim().max(64).optional().default(""),
  amount: z.number().int().min(MIN_TRANSFER, "Minimum transfer is $1.00."),
  memo: z.string().trim().max(160, "Keep the note under 160 characters.").optional().default(""),
  pin: z.string().regex(/^\d{4}$/, "Enter your 4-digit transaction PIN."),
});

export type SimpleTransferInput = z.infer<typeof simpleTransferInputSchema>;
