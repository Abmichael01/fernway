import { z } from "zod";
import { parseMajorAmount } from "@/lib/money";
import { MAX_TRADE, MIN_TRADE } from "@/lib/trades";
import { amountField } from "./money";

export const tradeSchema = z.object({
  side: z.enum(["buy", "sell"]),
  symbol: z.enum(["BTC", "ETH", "SOL", "USDC"]),
  amount: amountField.refine((value) => (parseMajorAmount(value) ?? 0) >= 1_000, "The minimum trade is $10."),
});

export type TradeValues = z.infer<typeof tradeSchema>;

/* API payloads (cents). */

const symbolField = z.enum(["BTC", "ETH", "SOL", "USDC"]);
const tradeAmount = z.number().int().min(MIN_TRADE, "The minimum trade is $10.").max(MAX_TRADE, "The largest trade is $100,000.");

export const tradeQuoteQuerySchema = z.object({
  side: z.enum(["buy", "sell"]),
  symbol: symbolField,
  amount: z.coerce.number().int().min(0).max(MAX_TRADE),
});

export const tradeInputSchema = z.object({
  side: z.enum(["buy", "sell"]),
  symbol: symbolField,
  amount: tradeAmount,
  accountId: z.uuid("Choose an account."),
});

export const priceRangeSchema = z.enum(["1W", "1M", "3M", "1Y"]);

/** Admin: a past crypto buy, priced at the market price of that moment. */
export const adminTradeFormSchema = z.object({
  accountId: z.string().min(1, "Choose the account that paid."),
  symbol: symbolField,
  amount: amountField.refine((value) => (parseMajorAmount(value) ?? 0) >= MIN_TRADE, "The minimum buy is $10."),
  occurredAt: z
    .string()
    .min(1, "Choose when it happened.")
    .refine((value) => new Date(value).getTime() <= Date.now(), "That's in the future.")
    .refine((value) => Date.now() - new Date(value).getTime() <= 364 * 86_400_000, "Prices go back 12 months at most."),
});

export type AdminTradeFormValues = z.infer<typeof adminTradeFormSchema>;

export const adminTradeInputSchema = z.object({
  accountId: z.uuid("Choose the account that paid."),
  symbol: symbolField,
  amount: tradeAmount,
  occurredAt: z.iso
    .datetime({ offset: true })
    .refine((value) => new Date(value).getTime() <= Date.now() + 60_000, "That's in the future.")
    .refine((value) => Date.now() - new Date(value).getTime() <= 364 * 86_400_000, "Prices go back 12 months at most."),
});

export type AdminTradeInput = z.infer<typeof adminTradeInputSchema>;
