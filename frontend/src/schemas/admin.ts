import { z } from "zod";
import { parseMajorAmount } from "@/lib/money";
import { amountField } from "./money";

/**
 * Admin forms (strings, as typed) and the JSON payloads the admin API accepts (cents, ISO dates).
 * `src/api/admin.ts` maps one to the other; the server validates the payload with these schemas.
 */

const categories = [
  "income",
  "transfer",
  "housing",
  "groceries",
  "dining",
  "transport",
  "bills",
  "shopping",
  "entertainment",
  "savings",
  "crypto",
  "fees",
] as const;
const channels = ["ach", "wire", "card", "internal", "crypto"] as const;
const statuses = ["completed", "pending", "failed"] as const;

const password = z
  .string()
  .min(10, "Use at least 10 characters.")
  .regex(/[A-Za-z]/, "Include at least one letter.")
  .regex(/\d/, "Include at least one number.");

const profileFields = {
  firstName: z.string().trim().min(1, "Enter a first name.").max(50),
  lastName: z.string().trim().min(1, "Enter a last name.").max(50),
  email: z.email("Enter a valid email address.").transform((value) => value.toLowerCase()),
  phone: z
    .string()
    .trim()
    .regex(/^(\+1\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/, "Enter a US phone number, e.g. (415) 555-0142.")
    .or(z.literal("")),
  addressLine1: z.string().trim().max(120),
  city: z.string().trim().max(60),
  state: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{2}$/, "Use the 2-letter state code, e.g. CA.")
    .or(z.literal("")),
  postalCode: z
    .string()
    .trim()
    .regex(/^\d{5}(-\d{4})?$/, "Enter a 5-digit ZIP code.")
    .or(z.literal("")),
};

export const customerCreateSchema = z.object({
  ...profileFields,
  password,
  openChecking: z.boolean(),
  openSavings: z.boolean(),
  issueDebitCard: z.boolean(),
});
export type CustomerCreateValues = z.input<typeof customerCreateSchema>;
export type CustomerCreateInput = z.output<typeof customerCreateSchema>;

export const customerUpdateSchema = z.object({
  ...profileFields,
  disabled: z.boolean(),
  theme: z.string().optional(),
});
export type CustomerUpdateValues = z.input<typeof customerUpdateSchema>;
export type CustomerUpdateInput = z.output<typeof customerUpdateSchema>;

export const accountOpenFormSchema = z.object({
  type: z.enum(["checking", "savings"]),
  name: z.string().trim().min(2, "Name the account, e.g. Everyday checking.").max(40),
  apy: z
    .string()
    .trim()
    .regex(/^(\d{1,2}(\.\d{1,2})?)?$/, "Enter a rate like 4.10."),
  goalName: z.string().trim().max(40),
  goalTarget: z.string().trim(),
});
export type AccountOpenValues = z.infer<typeof accountOpenFormSchema>;

export const accountOpenSchema = z.object({
  type: z.enum(["checking", "savings"]),
  name: z.string().trim().min(2).max(40),
  apyBps: z.number().int().min(0).max(2000),
  goalName: z.string().trim().max(40).nullable(),
  goalTarget: z.number().int().positive().nullable(),
});
export type AccountOpenInput = z.infer<typeof accountOpenSchema>;

export const transactionFormSchema = z
  .object({
    accountId: z.string().min(1, "Choose an account."),
    direction: z.enum(["credit", "debit"]),
    amount: amountField.refine((value) => (parseMajorAmount(value) ?? 0) > 0, "Enter an amount above $0."),
    fee: z.string().trim().refine((value) => value === "" || parseMajorAmount(value) !== null, "Enter a fee like 2.00."),
    counterparty: z.string().trim().min(2, "Enter who paid or was paid.").max(80),
    counterpartyDetail: z.string().trim().max(80),
    narration: z.string().trim().max(80),
    category: z.enum(categories),
    channel: z.enum(channels),
    status: z.enum(statuses),
    /** `datetime-local` value in the admin's time zone. */
    occurredAt: z.string().min(1, "Choose the date and time."),
    cardId: z.string(),
  })
  .refine((values) => new Date(values.occurredAt).getTime() <= Date.now() + 60_000, {
    message: "The date can't be in the future.",
    path: ["occurredAt"],
  });
export type TransactionFormValues = z.infer<typeof transactionFormSchema>;

export const transactionInputSchema = z.object({
  direction: z.enum(["credit", "debit"]),
  amount: z.number().int().positive("Enter an amount above $0.").max(10_000_000_00, "That's above the $10M limit."),
  fee: z.number().int().min(0).max(1_000_00),
  counterparty: z.string().trim().min(2).max(80),
  counterpartyDetail: z.string().trim().max(80).nullable(),
  narration: z.string().trim().max(80),
  category: z.enum(categories),
  channel: z.enum(channels),
  status: z.enum(statuses),
  occurredAt: z.iso
    .datetime({ offset: true })
    .refine((value) => new Date(value).getTime() <= Date.now() + 60_000, "The date can't be in the future."),
  cardId: z.uuid().nullable(),
});
export type TransactionInput = z.infer<typeof transactionInputSchema>;

export const billFormSchema = z.object({
  accountId: z.string().min(1, "Choose the account it's paid from."),
  payee: z.string().trim().min(2, "Who is paid, e.g. Verizon Wireless.").max(60),
  category: z.enum(categories),
  amount: amountField.refine((value) => (parseMajorAmount(value) ?? 0) > 0, "Enter an amount above $0."),
  dayOfMonth: z.string().regex(/^([1-9]|1\d|2[0-8])$/, "Choose a day from 1 to 28."),
  autopay: z.boolean(),
});
export type BillFormValues = z.infer<typeof billFormSchema>;

export const billInputSchema = z.object({
  accountId: z.uuid(),
  payee: z.string().trim().min(2).max(60),
  category: z.enum(categories),
  amount: z.number().int().positive().max(1_000_000_00),
  dayOfMonth: z.number().int().min(1).max(28),
  autopay: z.boolean(),
});
export type BillInput = z.infer<typeof billInputSchema>;

export const cardIssueFormSchema = z.object({
  accountId: z.string().min(1, "Choose the account the card spends from."),
  kind: z.enum(["physical", "virtual"]),
  label: z.string().trim().min(2, "Name the card, e.g. Debit card.").max(30),
  monthlyLimit: amountField.refine((value) => (parseMajorAmount(value) ?? 0) >= 100_00, "Set a limit of at least $100."),
});
export type CardIssueValues = z.infer<typeof cardIssueFormSchema>;

export const cardIssueSchema = z.object({
  accountId: z.uuid(),
  kind: z.enum(["physical", "virtual"]),
  label: z.string().trim().min(2).max(30),
  monthlyLimit: z.number().int().min(100_00).max(1_000_000_00),
});
export type CardIssueInput = z.infer<typeof cardIssueSchema>;
