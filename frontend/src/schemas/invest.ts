import { z } from "zod";
import { addressHint, isValidAddress, isValidMix, MAX_TRADE, MAX_WITHDRAWAL, MIN_TRADE, MIN_WITHDRAWAL, RISKS } from "@/lib/invest";
import { parseMajorAmount } from "@/lib/money";
import { amountField } from "./money";

const symbolField = z.enum(["BTC", "ETH", "SOL", "USDC"]);
const riskField = z.enum(["conservative", "balanced", "growth", "aggressive"]) satisfies z.ZodType<(typeof RISKS)[number]>;

/* ---------- Customer forms (typed dollars) ---------- */

export const investSignInSchema = z.object({
  email: z.string().trim().email("Enter your email address."),
  password: z.string().min(1, "Enter your password."),
});
export type InvestSignInValues = z.infer<typeof investSignInSchema>;

/** Invest in a portfolio, take money out of one, or buy/sell a coin directly. */
export const investAmountFormSchema = z.object({
  amount: amountField.refine((value) => (parseMajorAmount(value) ?? 0) >= MIN_TRADE, "The minimum is $10."),
});
export type InvestAmountFormValues = z.infer<typeof investAmountFormSchema>;

export const withdrawalFormSchema = z
  .object({
    symbol: symbolField,
    address: z.string().trim().min(1, "Paste the address to send to."),
    amount: amountField.refine((value) => (parseMajorAmount(value) ?? 0) >= MIN_WITHDRAWAL, "The minimum withdrawal is $20."),
  })
  .superRefine((value, ctx) => {
    if (value.address && !isValidAddress(value.symbol, value.address)) {
      ctx.addIssue({ code: "custom", path: ["address"], message: `That isn't a valid address. ${addressHint(value.symbol)}` });
    }
  });
export type WithdrawalFormValues = z.infer<typeof withdrawalFormSchema>;

/* ---------- Customer API payloads (cents) ---------- */

export const investLoginInputSchema = investSignInSchema;

const tradeAmount = z.number().int().min(MIN_TRADE, "The minimum is $10.").max(MAX_TRADE, "The largest amount is $100,000.");

export const portfolioInvestInputSchema = z.object({ amount: tradeAmount });

/** Take `amount` out of a portfolio, or everything with `all: true`. */
export const portfolioWithdrawInputSchema = z.union([
  z.object({ all: z.literal(true) }),
  z.object({ amount: tradeAmount }),
]);

export const directTradeInputSchema = z.object({
  side: z.enum(["buy", "sell"]),
  symbol: symbolField,
  amount: tradeAmount,
});

export const investQuoteQuerySchema = z.object({
  side: z.enum(["buy", "sell"]),
  /** A portfolio id, or a coin symbol for a direct trade. */
  target: z.string().min(1),
  amount: z.coerce.number().int().min(0).max(MAX_TRADE),
});

export const depositAddressInputSchema = z.object({ symbol: symbolField });

export const withdrawalInputSchema = z
  .object({
    symbol: symbolField,
    address: z.string().trim().min(1, "Paste the address to send to.").max(128),
    amount: z.number().int().min(MIN_WITHDRAWAL, "The minimum withdrawal is $20.").max(MAX_WITHDRAWAL, "The largest withdrawal is $100,000."),
  })
  .superRefine((value, ctx) => {
    if (!isValidAddress(value.symbol, value.address)) {
      ctx.addIssue({ code: "custom", path: ["address"], message: `That isn't a valid address. ${addressHint(value.symbol)}` });
    }
  });

/* ---------- Admin ---------- */

const name = (label: string) => z.string().trim().min(1, `Enter the ${label}.`).max(80);

export const adminInvestCustomerCreateSchema = z.object({
  firstName: name("first name"),
  lastName: name("last name"),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  phone: z.string().trim().max(32).default(""),
  password: z.string().min(10, "Use at least 10 characters.").max(128),
});
export type AdminInvestCustomerCreateInput = z.infer<typeof adminInvestCustomerCreateSchema>;

export const adminInvestCustomerUpdateSchema = z
  .object({
    firstName: name("first name"),
    lastName: name("last name"),
    phone: z.string().trim().max(32),
    disabled: z.boolean(),
    password: z.string().min(10, "Use at least 10 characters.").max(128),
  })
  .partial();
export type AdminInvestCustomerUpdateInput = z.infer<typeof adminInvestCustomerUpdateSchema>;

const allocationsField = z
  .array(z.object({ symbol: symbolField, weightBps: z.number().int().min(0).max(10_000) }))
  .refine((items) => items.length === 0 || isValidMix(items), "Each coin once, every coin above 0%, and the weights must add up to 100%.")
  .transform((items) => (items.length === 0 ? [{ symbol: "USDC" as const, weightBps: 10_000 }] : items));

export const adminPortfolioSchema = z.object({
  name: name("offering name"),
  summary: z.string().trim().min(1, "Write a one-line summary.").max(160),
  description: z.string().trim().max(2_000).default(""),
  imageUrl: z.string().trim().max(500_000).default(""),
  risk: riskField,
  autoDailyEnabled: z.boolean().default(false),
  dailyRateBps: z.number().int().min(0).max(50_000).default(0),
  dailyFixedCents: z.number().int().min(0).max(100_000_000).default(0),
  allocations: allocationsField.default([{ symbol: "USDC", weightBps: 10_000 }]),
  published: z.boolean().default(false),
});
export type AdminPortfolioInput = z.infer<typeof adminPortfolioSchema>;

export const adminPortfolioUpdateSchema = adminPortfolioSchema.partial();
export type AdminPortfolioUpdateInput = z.infer<typeof adminPortfolioUpdateSchema>;

export const adminRecordEarningSchema = z.object({
  portfolioId: z.string().uuid().optional().nullable(),
  amount: z.number().int().min(1, "Enter an amount above $0.00.").max(100_000_000),
  note: z.string().trim().max(160).default(""),
});
export type AdminRecordEarningInput = z.infer<typeof adminRecordEarningSchema>;

export const adminWithdrawalPaySchema = z.object({
  txid: z.string().trim().min(8, "Paste the transaction ID of the payment you sent.").max(128),
});

export const adminWithdrawalRejectSchema = z.object({
  reason: z.string().trim().min(5, "Tell the customer why.").max(300),
});

export const investSettingsSchema = z
  .object({
    depositsOpen: z.boolean(),
    addresses: z.object({
      BTC: z.string().trim().max(128),
      ETH: z.string().trim().max(128),
      SOL: z.string().trim().max(128),
      USDC: z.string().trim().max(128),
    }),
  })
  .superRefine((value, ctx) => {
    for (const symbol of ["BTC", "ETH", "SOL", "USDC"] as const) {
      const address = value.addresses[symbol];
      if (address && !isValidAddress(symbol, address)) {
        ctx.addIssue({ code: "custom", path: ["addresses", symbol], message: `Not a valid address. ${addressHint(symbol)}` });
      }
    }
  });
export type InvestSettingsInput = z.infer<typeof investSettingsSchema>;
