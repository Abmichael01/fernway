import type {
  CryptoSymbol,
  PriceRange,
  TradeSide,
  TransactionFilters,
  TransferMethod,
} from "@/types/banking";

export const queryKeys = {
  currentUser: ["users", "me"] as const,
  accounts: ["accounts"] as const,
  balanceHistory: (days: number) => ["accounts", "history", days] as const,
  transactions: {
    all: ["transactions"] as const,
    list: (filters: TransactionFilters) => ["transactions", "list", filters] as const,
    monthSummary: ["transactions", "month-summary"] as const,
    cashFlow: (weeks: number) => ["transactions", "cash-flow", weeks] as const,
    upcoming: ["transactions", "upcoming"] as const,
    netTrend: ["transactions", "net-trend"] as const,
  },
  cards: ["cards"] as const,
  settings: ["settings"] as const,
  admin: {
    all: ["admin"] as const,
    stats: ["admin", "stats"] as const,
    customers: ["admin", "customers"] as const,
    customer: (id: string) => ["admin", "customers", id] as const,
    transactions: (customerId: string, accountId?: string) =>
      ["admin", "customers", customerId, "transactions", accountId ?? "all"] as const,
  },
  transfers: {
    recipients: ["transfers", "recipients"] as const,
    routing: (routingNumber: string) => ["transfers", "routing", routingNumber] as const,
    quote: (method: TransferMethod, amount: number) => ["transfers", "quote", method, amount] as const,
  },
  vault: {
    all: ["vault"] as const,
    overview: (walletId?: string) => ["vault", "overview", walletId ?? "active"] as const,
    wallets: ["vault", "wallets"] as const,
    adminWallets: ["vault", "admin-wallets"] as const,
    customer: (customerId: string) => ["vault", "customer", customerId] as const,
  },
  crypto: {
    all: ["crypto"] as const,
    assets: ["crypto", "assets"] as const,
    market: ["crypto", "market"] as const,
    portfolioHistory: (range: PriceRange) => ["crypto", "portfolio", range] as const,
    history: (symbol: CryptoSymbol, range: PriceRange) => ["crypto", "history", symbol, range] as const,
    quote: (side: TradeSide, symbol: CryptoSymbol, amount: number) =>
      ["crypto", "quote", side, symbol, amount] as const,
  },
};
