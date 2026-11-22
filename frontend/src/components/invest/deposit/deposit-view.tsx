"use client";

import { ArrowDownToLine } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState, QueryError } from "@/components/shared/query-states";
import { Skeleton } from "@/components/ui/skeleton";
import { useInvestDeposits } from "@/hooks/invest/useInvestDeposits";
import { DepositCoinCard } from "./deposit-coin-card";
import { DepositPayments } from "./deposit-payments";

export function DepositView() {
  const { data, isPending, isError, refetch } = useInvestDeposits();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Deposit" description="Fund your investing cash by sending crypto to your own deposit address." />
      {isError && !data ? (
        <QueryError message="We couldn't load deposits." onRetry={() => void refetch()} />
      ) : isPending ? (
        <div className="grid gap-4 md:grid-cols-2" aria-busy="true">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-44" />
          ))}
        </div>
      ) : !data.open ? (
        <EmptyState icon={<ArrowDownToLine />} title="Deposits aren't open yet" description="You'll be able to send crypto here once Fernway opens deposits." className="rounded-lg border border-dashed" />
      ) : (
        <>
          <div className="grid items-start gap-4 md:grid-cols-2">
            {data.coins.map((coin) => (
              <DepositCoinCard key={coin.symbol} coin={coin} />
            ))}
          </div>
          <DepositPayments payments={data.payments} />
        </>
      )}
    </div>
  );
}
