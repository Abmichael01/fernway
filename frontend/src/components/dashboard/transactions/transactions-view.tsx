"use client";

import { useDeferredValue, useState } from "react";
import { EmptyState, QueryError } from "@/components/shared/query-states";
import { TransactionList, TransactionListSkeleton } from "@/components/shared/transaction-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTransactions } from "@/hooks/transactions/useTransactions";
import { cn } from "@/lib/utils";
import type { TransactionFilters as Filters } from "@/types/banking";
import { TransactionFilters } from "./transaction-filters";

export function TransactionsView() {
  const [filters, setFilters] = useState<Filters>({});
  const deferredSearch = useDeferredValue(filters.search ?? "");
  const query = useTransactions({ ...filters, search: deferredSearch || undefined });
  const { data: transactions, isPending, isError, isFetching, refetch } = query;

  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div className="flex flex-col gap-4">
      <TransactionFilters value={filters} onChange={setFilters} />
      <Card className="gap-0 py-3">
        <CardContent className={cn("px-2 transition-opacity", isFetching && !isPending && "opacity-60")}>
          {isError ? (
            <QueryError message="We couldn't load your transactions." onRetry={() => void refetch()} className="m-2" />
          ) : isPending ? (
            <TransactionListSkeleton rows={10} />
          ) : transactions.length === 0 ? (
            <EmptyState
              title={hasFilters ? "No transactions match" : "No transactions yet"}
              description={
                hasFilters
                  ? "Try a different name or reference, or clear the filters."
                  : "Payments in and out of your accounts will be listed here."
              }
              action={
                hasFilters && (
                  <Button variant="outline" size="sm" onClick={() => setFilters({})}>
                    Clear filters
                  </Button>
                )
              }
            />
          ) : (
            <>
              <p className="px-2 pb-3 text-[0.8rem] text-muted-foreground" aria-live="polite">
                {transactions.length} {transactions.length === 1 ? "transaction" : "transactions"}
              </p>
              <TransactionList transactions={transactions} />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
