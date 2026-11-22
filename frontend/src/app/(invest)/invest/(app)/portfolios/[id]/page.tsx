import type { Metadata } from "next";
import { Suspense } from "react";
import { PortfolioDetail, PortfolioDetailSkeleton } from "@/components/invest/portfolios/portfolio-detail";

export const metadata: Metadata = { title: "Portfolio" };

/** The id comes from the URL, so it is read inside Suspense: the page shell can render before it. */
export default function PortfolioPage({ params }: PageProps<"/invest/portfolios/[id]">) {
  return (
    <Suspense fallback={<PortfolioDetailSkeleton />}>
      <PortfolioFromParams params={params} />
    </Suspense>
  );
}

async function PortfolioFromParams({ params }: Pick<PageProps<"/invest/portfolios/[id]">, "params">) {
  const { id } = await params;
  return <PortfolioDetail id={id} />;
}
