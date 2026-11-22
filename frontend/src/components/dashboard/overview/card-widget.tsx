"use client";

import Link from "next/link";
import { ArrowRight, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { CardFace } from "@/components/shared/card-face";
import { Money } from "@/components/shared/money";
import { EmptyState, QueryError } from "@/components/shared/query-states";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useCards } from "@/hooks/cards/useCards";
import { useUpdateCardSettings } from "@/hooks/cards/useUpdateCardSettings";

export function CardWidget() {
  const { data: cards, isPending, isError, refetch } = useCards();
  const updateSettings = useUpdateCardSettings();
  const card = cards?.find((item) => item.kind === "physical") ?? cards?.[0];

  return (
    <Card className="h-full gap-4">
      <CardHeader>
        <CardTitle className="font-heading text-base font-semibold">My card</CardTitle>
        <CardAction>
          <Button asChild variant="ghost" size="sm">
            <Link href="/cards">
              Manage
              <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {isError ? (
          <QueryError message="We couldn't load your card." onRetry={() => void refetch()} />
        ) : isPending ? (
          <Skeleton className="aspect-[1.586] w-full" />
        ) : !card ? (
          <EmptyState icon={<CreditCard />} title="No card yet" description="Order a physical debit card from Cards." />
        ) : (
          <>
            <CardFace card={card} tone="accent" />
            <div className="flex items-center justify-between gap-4">
              <label htmlFor="widget-freeze" className="text-sm font-medium">
                Freeze card
              </label>
              <Switch
                id="widget-freeze"
                checked={card.frozen}
                onCheckedChange={(frozen) =>
                  updateSettings.mutate(
                    { cardId: card.id, update: { frozen } },
                    {
                      onSuccess: () => toast.success(frozen ? `${card.label} frozen` : `${card.label} unfrozen`),
                      onError: (error) => toast.error(`${error.message} Your card settings haven't changed.`),
                    },
                  )
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between text-sm">
                <span className="text-muted-foreground">Spent this month</span>
                <span>
                  <Money amount={card.spentThisMonth} currency={card.currency} whole className="font-semibold" />
                  <span className="text-muted-foreground">
                    {" "}
                    / <Money amount={card.monthlyLimit} currency={card.currency} whole />
                  </span>
                </span>
              </div>
              <Progress value={Math.min((card.spentThisMonth / card.monthlyLimit) * 100, 100)} aria-label="Share of monthly card limit used" />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
