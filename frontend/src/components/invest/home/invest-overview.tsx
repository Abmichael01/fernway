"use client";

import { PageHeader } from "@/components/shared/page-header";
import { QueryError } from "@/components/shared/query-states";
import { useInvestMe } from "@/hooks/invest/useInvestMe";
import { useInvestOverview } from "@/hooks/invest/useInvestOverview";
import { PricesWarning } from "../shared/prices-warning";
import { HomeEmpty } from "./home-empty";
import { HomeSkeleton } from "./home-skeleton";
import { PositionsList } from "./positions-list";
import { QuickActions } from "./quick-actions";
import { StatCards } from "./stat-cards";
import { ValueChart } from "./value-chart";

export function InvestOverview() {
  const { data: me } = useInvestMe();
  const { data: overview, isPending, isError, refetch } = useInvestOverview();

  if (isError) return <QueryError message="We couldn't load your investments." onRetry={() => void refetch()} />;
  if (isPending) return <HomeSkeleton />;

  const nothingHeld = overview.portfolios.length === 0 && overview.direct.length === 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={me ? `Hello, ${me.firstName}` : "Overview"} description="Your investing cash and what you hold." />
      {!overview.pricesLive && <PricesWarning />}
      <StatCards overview={overview} />
      <QuickActions />
      {nothingHeld ? (
        <HomeEmpty hasCash={overview.cash > 0} />
      ) : (
        <>
          <ValueChart />
          <PositionsList overview={overview} />
        </>
      )}
    </div>
  );
}
