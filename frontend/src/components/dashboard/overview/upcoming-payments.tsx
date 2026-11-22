"use client";

import { CalendarCheck } from "lucide-react";
import { CategoryIcon } from "@/components/shared/category-icon";
import { Money } from "@/components/shared/money";
import { EmptyState, QueryError } from "@/components/shared/query-states";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Skeleton } from "@/components/ui/skeleton";
import { siteConfig } from "@/config/site";
import { useUpcomingPayments } from "@/hooks/transactions/useInsights";

function dueLabel(iso: string): string {
  const due = new Date(iso);
  const today = new Date();
  const days = Math.round(
    (new Date(due.getFullYear(), due.getMonth(), due.getDate()).getTime() -
      new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) /
      86_400_000,
  );
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `Due ${due.toLocaleDateString(siteConfig.locale, { month: "short", day: "numeric" })}`;
}

export function UpcomingPayments() {
  const { data: payments, isPending, isError, refetch } = useUpcomingPayments();

  return (
    <Card className="gap-2">
      <CardHeader>
        <CardTitle className="font-heading text-base font-semibold">Upcoming bills</CardTitle>
        <CardDescription>Next 30 days</CardDescription>
      </CardHeader>
      <CardContent className="px-2">
        {isError ? (
          <QueryError message="We couldn't load upcoming bills." onRetry={() => void refetch()} className="mx-2" />
        ) : isPending ? (
          <div className="flex flex-col gap-2 px-2" aria-hidden="true">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        ) : payments.length === 0 ? (
          <EmptyState icon={<CalendarCheck />} title="No bills coming up" description="Scheduled payments will show here." className="py-6" />
        ) : (
          <ItemGroup>
            {payments.map((payment) => (
              <Item key={payment.id} size="sm" className="px-2">
                <ItemMedia>
                  <CategoryIcon category={payment.category} className="size-9" />
                </ItemMedia>
                <ItemContent className="min-w-0">
                  <ItemTitle className="truncate">{payment.payee}</ItemTitle>
                  <ItemDescription>{dueLabel(payment.dueDate)}</ItemDescription>
                </ItemContent>
                <ItemActions className="flex-col items-end gap-1">
                  <Money amount={payment.amount} currency={siteConfig.defaultCurrency} className="text-sm font-semibold" />
                  {payment.autopay && (
                    <Badge variant="secondary" className="h-5 px-1.5 text-[0.68rem]">
                      Autopay
                    </Badge>
                  )}
                </ItemActions>
              </Item>
            ))}
          </ItemGroup>
        )}
      </CardContent>
    </Card>
  );
}
