import type { Metadata } from "next";
import { InvestOverview } from "@/components/invest/home/invest-overview";

export const metadata: Metadata = { title: "Overview" };

export default function InvestOverviewPage() {
  return <InvestOverview />;
}
