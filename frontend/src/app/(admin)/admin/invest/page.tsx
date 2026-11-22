import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InvestOverview } from "@/components/admin/invest/home/invest-overview";
import { INVEST_ENABLED } from "@/config/features";

/** Admin pages wait for the access check before rendering, so they opt out of instant-navigation validation. */
export const instant = false;

export const metadata: Metadata = { title: "Invest" };

export default function Page() {
  if (!INVEST_ENABLED) notFound();
  return <InvestOverview />;
}
