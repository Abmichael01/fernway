"use client";

import { Money } from "@/components/shared/money";
import { PageHeader } from "@/components/shared/page-header";
import { QueryError } from "@/components/shared/query-states";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useInvestOverview } from "@/hooks/invest/useInvestOverview";
import { WithdrawForm } from "./withdraw-form";
import { WithdrawalList } from "./withdrawal-list";

export function WithdrawView() {
  const overview = useInvestOverview();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Withdraw" description="Send money from your investing cash to your own crypto wallet." />
      <div className="grid items-start gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-heading text-base font-semibold">Request a withdrawal</CardTitle>
            <CardDescription>
              A Fernway team member sends your payment by hand. The amount is held from your cash until it&apos;s paid or declined; if it&apos;s declined, the money comes back to your cash.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            {overview.isError ? (
              <QueryError message="We couldn't load your cash." onRetry={() => void overview.refetch()} />
            ) : (
              <div className="rounded-lg bg-muted/60 px-4 py-3">
                <p className="text-xs text-muted-foreground">Available cash</p>
                {overview.isPending ? (
                  <Skeleton className="mt-1 h-7 w-28" />
                ) : (
                  <Money amount={overview.data.cash} currency="USD" className="font-heading text-2xl font-semibold" />
                )}
              </div>
            )}
            <WithdrawForm cash={overview.data?.cash ?? 0} />
          </CardContent>
        </Card>
        <div className="lg:col-span-3">
          <WithdrawalList />
        </div>
      </div>
    </div>
  );
}
