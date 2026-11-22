import type { PriceRange, TradeSide } from "@/types/invest";

export const investKeys = {
  all: ["invest"] as const,
  me: ["invest", "me"] as const,
  overview: ["invest", "overview"] as const,
  history: (range: PriceRange) => ["invest", "history", range] as const,
  historyAll: ["invest", "history"] as const,
  prices: ["invest", "prices"] as const,
  portfolios: ["invest", "portfolios"] as const,
  portfolio: (id: string) => ["invest", "portfolios", id] as const,
  quote: (side: TradeSide, target: string, amount: number) => ["invest", "quote", side, target, amount] as const,
  transactions: ["invest", "transactions"] as const,
  deposits: ["invest", "deposits"] as const,
  withdrawals: ["invest", "withdrawals"] as const,
};
