"use client";

import type { ReactNode } from "react";
import { Landmark, type LucideIcon, PiggyBank, Scale } from "lucide-react";
import { Money } from "@/components/shared/money";
import { Sparkline } from "@/components/shared/sparkline";
import { Skeleton } from "@/components/ui/skeleton";
import { siteConfig } from "@/config/site";
import { useAccounts } from "@/hooks/accounts/useAccounts";
import { useBalanceHistory } from "@/hooks/accounts/useBalanceHistory";
import { useMonthSummary, useNetTrend } from "@/hooks/transactions/useInsights";
import type { TrendPoint } from "@/types/banking";

const HISTORY_DAYS = 30;

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  period: string;
  value: ReactNode;
  footer: ReactNode;
  loading: boolean;
  trend: TrendPoint[] | undefined;
  trendColor?: string;
  trendWithTime?: boolean;
}

function StatCard({ icon: Icon, label, period, value, footer, loading, trend, trendColor, trendWithTime }: StatCardProps) {
  return (
    <div className="group relative flex w-[80%] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border bg-card transition-shadow hover:shadow-[0_15px_35px_rgb(26_28_35/0.08)] sm:w-auto">
      <span
        aria-hidden="true"
        className="bg-brand-gradient absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
      />
      <div className="flex flex-col gap-4 p-5 pb-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="bg-brand-gradient grid size-8 shrink-0 place-items-center rounded-full text-white">
              <Icon className="size-4" strokeWidth={1.8} aria-hidden="true" />
            </span>
            <span className="truncate text-sm font-medium text-muted-foreground">{label}</span>
          </div>
          <span className="shrink-0 text-[0.7rem] font-medium tracking-wide text-muted-foreground uppercase">{period}</span>
        </div>
        {loading ? (
          <div className="flex flex-col gap-2" aria-hidden="true">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-40" />
          </div>
        ) : (
          <div>
            <div className="font-heading text-[26px] leading-tight font-medium">{value}</div>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">{footer}</div>
          </div>
        )}
      </div>
      <div className="mt-auto">
        {trend && trend.length > 1 ? (
          <Sparkline points={trend} label={label} color={trendColor} withTime={trendWithTime} />
        ) : (
          <Skeleton className="mx-5 mb-4 h-12" />
        )}
      </div>
    </div>
  );
}

export function StatCards() {
  const { data: accounts, isPending: accountsPending } = useAccounts();
  const { data: summary, isPending: summaryPending } = useMonthSummary();
  const { data: balances } = useBalanceHistory(HISTORY_DAYS);
  const { data: netTrend } = useNetTrend();

  const primaryAccount = accounts?.find((account) => account.type === "checking") ?? accounts?.[0];
  const savings = accounts?.find((account) => account.type === "savings");
  const hasSeparateSavings = Boolean(savings && primaryAccount && savings.id !== primaryAccount.id);
  const goalShare = savings?.goal ? Math.round((savings.balance / savings.goal.target) * 100) : null;
  const net = summary ? summary.moneyIn - summary.moneyOut : 0;

  return (
    <div
      className={`-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:grid sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden ${
        hasSeparateSavings ? "sm:grid-cols-3" : "sm:grid-cols-2"
      }`}
    >
      <StatCard
        icon={Landmark}
        label="Account balance"
        period="30 days"
        loading={accountsPending}
        trend={balances?.checking}
        value={primaryAccount && <Money amount={primaryAccount.balance} currency={primaryAccount.currency} sensitive />}
        footer={
          primaryAccount && (
            <>
              <Money amount={primaryAccount.availableBalance} currency={primaryAccount.currency} sensitive /> available
            </>
          )
        }
      />
      {hasSeparateSavings && savings && (
        <StatCard
          icon={PiggyBank}
          label="Savings"
          period="30 days"
          loading={accountsPending}
          trend={balances?.savings}
          value={<Money amount={savings.balance} currency={savings.currency} sensitive />}
          footer={
            <>
              {savings.apy !== undefined && <span className="font-medium text-credit">{savings.apy.toFixed(2)}% APY</span>}
              {goalShare !== null && <span>· {goalShare}% of goal</span>}
            </>
          }
        />
      )}
      <StatCard
        icon={Scale}
        label={summary ? `${summary.periodLabel} net` : "This month net"}
        period="Month to date"
        loading={summaryPending}
        trend={netTrend}
        trendColor={net >= 0 ? "var(--credit)" : "var(--debit)"}
        value={
          summary && (
            <Money
              amount={net}
              currency={summary.currency}
              signed
              className={net >= 0 ? "text-credit" : undefined}
            />
          )
        }
        footer={
          summary && (
            <>
              In <Money amount={summary.moneyIn} currency={siteConfig.defaultCurrency} whole /> · Out{" "}
              <Money amount={summary.moneyOut} currency={siteConfig.defaultCurrency} whole />
            </>
          )
        }
      />
    </div>
  );
}
