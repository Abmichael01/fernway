"use client";

import Link from "next/link";
import { ArrowRight, Banknote, Hourglass, TrendingUp, Users } from "lucide-react";
import { RowsSkeleton } from "@/components/admin/invest/shared/table-skeleton";
import { StatCard } from "@/components/admin/invest/shared/stat-card";
import { CoinIcon } from "@/components/shared/coin-icon";
import { Money } from "@/components/shared/money";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState, QueryError } from "@/components/shared/query-states";
import { Button } from "@/components/ui/button";
import { useInvestStats } from "@/hooks/admin-invest/useInvestStats";
import { useInvestWithdrawals } from "@/hooks/admin-invest/useInvestWithdrawals";
import { formatDateTime } from "@/lib/dates";

export function InvestOverview() {
  const stats = useInvestStats();
  const waiting = useInvestWithdrawals("requested");
  const data = stats.data;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Fernway Invest" description="Customers, portfolios and payouts for the investing app." />

      {stats.isError ? (
        <QueryError message="We couldn't load the totals." onRetry={() => void stats.refetch()} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={Users}
            label="Customers"
            loading={stats.isPending}
            value={data?.customers.toLocaleString("en-US")}
            detail={data && (data.customers === 0 ? "None yet. Create the first one." : "With an Invest account")}
          />
          <StatCard
            icon={Banknote}
            label="Investing cash held"
            loading={stats.isPending}
            value={data && <Money amount={data.cash} currency="USD" />}
            detail="Not yet invested"
          />
          <StatCard
            icon={TrendingUp}
            label="Value invested"
            loading={stats.isPending}
            value={data && <Money amount={data.invested} currency="USD" />}
            detail="At current market prices"
          />
          <StatCard
            icon={Hourglass}
            label="Withdrawals waiting"
            loading={stats.isPending}
            value={data?.pendingWithdrawals.toLocaleString("en-US")}
            detail={data && <Money amount={data.pendingWithdrawalAmount} currency="USD" />}
          />
        </div>
      )}

      <section aria-labelledby="waiting" className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <h2 id="waiting" className="font-heading text-lg font-semibold">
            Withdrawals waiting
          </h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/invest/withdrawals">
              Open the queue <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
        </div>
        {waiting.isError ? (
          <QueryError message="We couldn't load withdrawals." onRetry={() => void waiting.refetch()} />
        ) : waiting.isPending ? (
          <RowsSkeleton rows={3} className="h-14" />
        ) : waiting.data.length === 0 ? (
          <EmptyState icon={<Hourglass />} title="Nothing waiting" description="Withdrawal requests appear here until you pay or decline them." />
        ) : (
          <ul className="divide-y rounded-md border">
            {waiting.data.slice(0, 5).map((item) => (
              <li key={item.id}>
                <Link href="/admin/invest/withdrawals" className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50">
                  <CoinIcon symbol={item.symbol} className="size-9" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{item.customer.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {item.symbol} · {formatDateTime(item.requestedAt)}
                    </span>
                  </span>
                  <Money amount={item.amount} currency="USD" className="font-medium" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
