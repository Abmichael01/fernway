/** Navigation and product constants for Fernway Invest. */
export const investConfig = {
  name: "Lindenway Invest",
  signInPath: "/invest/sign-in",
  homePath: "/invest",
} as const;

export const investNavItems = [
  { href: "/invest", label: "Overview", shortLabel: "Home", icon: "LayoutDashboard" },
  { href: "/invest/portfolios", label: "Investments", shortLabel: "Invest", icon: "PieChart" },
  { href: "/invest/deposit", label: "Deposit", shortLabel: "Deposit", icon: "ArrowDownToLine" },
  { href: "/invest/withdraw", label: "Withdraw", shortLabel: "Withdraw", icon: "ArrowUpFromLine" },
  { href: "/invest/transactions", label: "Transactions", shortLabel: "Transactions", icon: "ReceiptText" },
] as const;

export type InvestNavItem = (typeof investNavItems)[number];
export type InvestNavIcon = InvestNavItem["icon"];

export const INVEST_DISCLOSURE =
  "Lindenway Invest is run by Lindenway, a financial technology company. Lindenway is not a bank, broker-dealer or registered investment adviser. Crypto is not FDIC- or SIPC-insured and can lose some or all of its value. Managed portfolios are fixed mixes of coins chosen by Lindenway; their value follows market prices and no return is promised.";

export const PORTFOLIO_NOTE =
  "No return is promised. The value of this portfolio moves with the market prices of its coins and can fall.";

/** Only accept a post-sign-in destination inside Invest. */
export function safeInvestNext(next: string | null | undefined): string {
  if (next && next.startsWith("/invest") && !next.startsWith("//") && !next.startsWith("/invest/sign-in")) return next;
  return investConfig.homePath;
}
