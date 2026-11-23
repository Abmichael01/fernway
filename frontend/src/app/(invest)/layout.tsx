import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: { default: "Lindenway Invest", template: "%s · Lindenway Invest" },
  description: "Managed crypto portfolios and direct crypto, from Lindenway.",
  robots: { index: false, follow: false },
};

export default function InvestRootLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-dvh bg-background">{children}</div>;
}
