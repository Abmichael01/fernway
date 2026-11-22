"use client";

import Link from "next/link";
import { Money } from "@/components/shared/money";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useAccounts } from "@/hooks/accounts/useAccounts";

export function SavingsGoal() {
  const { data: accounts, isPending } = useAccounts();
  const savings = accounts?.find((account) => account.type === "savings" && account.goal);

  if (isPending) return <Skeleton className="h-40 w-full rounded-xl" />;
  if (!savings?.goal) return null;

  const share = Math.min(savings.balance / savings.goal.target, 1);

  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="font-heading text-base font-semibold">{savings.goal.name}</CardTitle>
        <CardDescription>
          {savings.name}
          {savings.apy !== undefined && ` · ${savings.apy.toFixed(2)}% APY`}
        </CardDescription>
        <CardAction>
          <Button asChild variant="outline" size="sm">
            <Link href="/transfers?tab=between">Add to savings</Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-2.5">
        <div className="flex items-baseline justify-between gap-3">
          <Money amount={savings.balance} currency={savings.currency} sensitive className="font-heading text-2xl font-bold" />
          <span className="text-sm text-muted-foreground">
            of <Money amount={savings.goal.target} currency={savings.currency} whole />
          </span>
        </div>
        <Progress value={share * 100} aria-label={`${Math.round(share * 100)}% of goal saved`} />
        <p className="text-xs text-muted-foreground">{Math.round(share * 100)}% of your goal</p>
      </CardContent>
    </Card>
  );
}
