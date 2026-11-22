"use client";

import { useState } from "react";
import { ArrowUpRight, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Money } from "@/components/shared/money";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTransactions } from "@/hooks/transactions/useTransactions";
import { formatDayLabel } from "@/lib/dates";
import { cn } from "@/lib/utils";
import type { Transaction } from "@/types/banking";
import { SendMoneyForm } from "./send-money-form";
import { TransferReceipt } from "./transfer-receipt";

function TransferStatusBadge({ status }: { status: Transaction["status"] }) {
  if (status === "pending") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-300">
        <Clock className="size-3" />
        Pending
      </span>
    );
  }
  if (status === "failed") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-destructive/15 px-2.5 py-0.5 text-[11px] font-semibold text-destructive">
        <XCircle className="size-3" />
        Declined
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
      <CheckCircle2 className="size-3" />
      Completed
    </span>
  );
}

export function SendMoneyView() {
  const [receipt, setReceipt] = useState<Transaction | null>(null);
  const { data: transactions, isPending } = useTransactions({});

  const transfers = (transactions ?? [])
    .filter((tx) => tx.direction === "debit" && (tx.category === "transfer" || tx.status === "pending"))
    .slice(0, 8);

  if (receipt) {
    return <TransferReceipt transaction={receipt} onDone={() => setReceipt(null)} />;
  }

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
      <SendMoneyForm onSent={setReceipt} />

      <Card className="rounded-2xl">
        <CardHeader className="border-b pb-4">
          <CardTitle className="font-heading text-base font-semibold">Transfer Requests</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isPending ? (
            <div className="space-y-3 p-5">
              <Skeleton className="h-14 w-full rounded-xl" />
              <Skeleton className="h-14 w-full rounded-xl" />
              <Skeleton className="h-14 w-full rounded-xl" />
            </div>
          ) : transfers.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-muted-foreground">
              Your outgoing transfer requests will appear here.
            </div>
          ) : (
            <ul className="divide-y divide-border/70">
              {transfers.map((tx) => (
                <li key={tx.id} className="flex items-start justify-between gap-3 px-5 py-3.5">
                  <div className="flex min-w-0 items-start gap-3">
                    <span
                      className={cn(
                        "mt-0.5 grid size-8 shrink-0 place-items-center rounded-full",
                        tx.status === "pending"
                          ? "bg-amber-500/15 text-amber-600 dark:text-amber-300"
                          : tx.status === "failed"
                            ? "bg-destructive/15 text-destructive"
                            : "bg-primary/10 text-primary",
                      )}
                    >
                      <ArrowUpRight className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{tx.counterparty}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {tx.counterpartyDetail || tx.narration}
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        <TransferStatusBadge status={tx.status} />
                        <span className="text-[11px] text-muted-foreground">{formatDayLabel(tx.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 text-right font-figure text-sm font-semibold tabular-nums text-foreground">
                    -<Money amount={tx.amount} currency={tx.currency} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
