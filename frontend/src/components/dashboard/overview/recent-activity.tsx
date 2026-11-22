"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, ReceiptText } from "lucide-react";
import { EmptyState, QueryError } from "@/components/shared/query-states";
import { TransactionDetailSheet } from "@/components/shared/transaction-detail-sheet";
import { TransactionListSkeleton } from "@/components/shared/transaction-list";
import { TransactionRow } from "@/components/shared/transaction-row";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTransactions } from "@/hooks/transactions/useTransactions";
import type { Transaction } from "@/types/banking";

const RECENT_LIMIT = 8;

export function RecentActivity() {
  const { data: transactions, isPending, isError, refetch } = useTransactions({ limit: RECENT_LIMIT });
  const [selected, setSelected] = useState<Transaction | null>(null);

  return (
    <Card className="gap-2">
      <CardHeader>
        <CardTitle className="font-heading text-base font-semibold">Recent transactions</CardTitle>
        <CardAction>
          <Button asChild variant="ghost" size="sm">
            <Link href="/transactions">
              View all
              <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="px-3">
        {isError ? (
          <QueryError message="We couldn't load your transactions." onRetry={() => void refetch()} />
        ) : isPending ? (
          <TransactionListSkeleton rows={6} />
        ) : transactions.length === 0 ? (
          <EmptyState icon={<ReceiptText />} title="No transactions yet" description="Money in and money out will show up here." />
        ) : (
          <ul className="flex flex-col divide-y divide-border/70">
            {transactions.map((transaction) => (
              <li key={transaction.id}>
                <TransactionRow transaction={transaction} onSelect={setSelected} showDate />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
      <TransactionDetailSheet transaction={selected} onOpenChange={(open) => !open && setSelected(null)} />
    </Card>
  );
}
