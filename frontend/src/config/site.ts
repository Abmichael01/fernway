import type { CurrencyCode } from "@/types/banking";

export const siteConfig = {
  name: "Fernway",
  description: "Online banking, transfers and debit cards in one account.",
  locale: "en-US",
  defaultCurrency: "USD" satisfies CurrencyCode,
} as const;

/** Areas that need a signed-in session. The proxy guards them; outside them a 401 is normal. */
export const signedInAreas = ["/overview", "/transactions", "/transfers", "/cards", "/admin"] as const;

export const isInSignedInArea = (pathname: string) =>
  signedInAreas.some((area) => pathname === area || pathname.startsWith(`${area}/`));

export const navItems = [
  { href: "/overview", label: "Overview", shortLabel: "Home", icon: "overview" },
  { href: "/transactions", label: "Transactions", shortLabel: "Activity", icon: "transactions" },
  { href: "/transfers", label: "Transfers", shortLabel: "Transfers", icon: "transfers" },
  { href: "/cards", label: "Cards", shortLabel: "Cards", icon: "cards" },
] as const;

export type NavItem = (typeof navItems)[number];
export type NavIcon = NavItem["icon"];
