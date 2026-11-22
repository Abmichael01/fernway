import type { Metadata } from "next";
import { PortfolioList } from "@/components/invest/portfolios/portfolio-list";

export const metadata: Metadata = { title: "Portfolios" };

export default function Page() {
  return <PortfolioList />;
}
