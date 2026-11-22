"use client";

import { PieChart } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState, QueryError } from "@/components/shared/query-states";
import { Skeleton } from "@/components/ui/skeleton";
import { usePortfolios } from "@/hooks/invest/usePortfolios";
import { PortfolioCard } from "./portfolio-card";

export function PortfolioList() {
  const { data, isPending, isError, refetch } = usePortfolios();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Portfolios" description="Fixed mixes of coins chosen by Fernway. Their value follows market prices." />
      {isError ? (
        <QueryError message="We couldn't load the portfolios." onRetry={() => void refetch()} />
      ) : isPending ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-busy="true">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-56" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <EmptyState icon={<PieChart />} title="No portfolios yet" description="No portfolios are available yet." className="rounded-lg border border-dashed" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.map((portfolio) => (
            <PortfolioCard key={portfolio.id} portfolio={portfolio} />
          ))}
        </div>
      )}
    </div>
  );
}
