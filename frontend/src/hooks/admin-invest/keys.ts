import type { WithdrawalStatus } from "@/types/invest";

const root = ["admin", "invest"] as const;

export const investAdminKeys = {
  all: root,
  stats: [...root, "stats"] as const,
  customers: [...root, "customers"] as const,
  customer: (id: string) => [...root, "customers", id] as const,
  portfolios: [...root, "portfolios"] as const,
  withdrawals: (status?: WithdrawalStatus) => [...root, "withdrawals", status ?? "all"] as const,
  deposits: [...root, "deposits"] as const,
  settings: [...root, "settings"] as const,
};
