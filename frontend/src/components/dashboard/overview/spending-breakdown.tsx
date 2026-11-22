"use client";

import { PieChart } from "lucide-react";
import { CategoryIcon } from "@/components/shared/category-icon";
import { Money } from "@/components/shared/money";
import { EmptyState, QueryError } from "@/components/shared/query-states";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { categoryLabels } from "@/config/categories";
import { useMonthSummary } from "@/hooks/transactions/useInsights";

const TOP_CATEGORIES = 5;

export function SpendingBreakdown() {
  const { data: summary, isPending, isError, refetch } = useMonthSummary();
  const top = summary?.categories.slice(0, TOP_CATEGORIES) ?? [];
  const largest = top[0]?.amount ?? 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-base font-semibold">Spending by category</CardTitle>
        <CardDescription>{summary ? `${summary.periodLabel} to date` : "Month to date"}</CardDescription>
      </CardHeader>
      <CardContent>
        {isError ? (
          <QueryError message="We couldn't load your spending." onRetry={() => void refetch()} />
        ) : isPending ? (
          <div className="flex flex-col gap-4" aria-hidden="true">
            {Array.from({ length: 5 }, (_, index) => (
              <Skeleton key={index} className="h-9 w-full" />
            ))}
          </div>
        ) : top.length === 0 ? (
          <EmptyState
            icon={<PieChart />}
            title="Nothing spent yet this month"
            description="Card payments, bills and transfers will be grouped here."
            className="py-6"
          />
        ) : (
          <ul className="flex flex-col gap-4">
            {top.map(({ category, amount }) => (
              <li key={category} className="flex items-center gap-3">
                <CategoryIcon category={category} className="size-9" />
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="truncate">{categoryLabels[category]}</span>
                    <Money amount={amount} currency={summary.currency} className="font-medium" />
                  </div>
                  <div className="h-1.5 rounded-full bg-muted" aria-hidden="true">
                    <div
                      className="h-full rounded-full bg-chart-1"
                      style={{ width: `${Math.max((amount / largest) * 100, 3)}%` }}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
