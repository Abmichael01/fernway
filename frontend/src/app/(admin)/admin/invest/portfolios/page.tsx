import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PortfoliosView } from "@/components/admin/invest/portfolios/portfolios-view";
import { INVEST_ENABLED } from "@/config/features";

/** Admin pages wait for the access check before rendering, so they opt out of instant-navigation validation. */
export const instant = false;

export const metadata: Metadata = { title: "Invest portfolios" };

export default function Page() {
  if (!INVEST_ENABLED) notFound();
  return <PortfoliosView />;
}
