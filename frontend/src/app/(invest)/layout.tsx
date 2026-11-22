import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: { default: "Fernway Invest", template: "%s · Fernway Invest" },
  description: "Managed crypto portfolios and direct crypto, from Fernway.",
  robots: { index: false, follow: false },
};

export default function InvestRootLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-dvh bg-background">{children}</div>;
}
