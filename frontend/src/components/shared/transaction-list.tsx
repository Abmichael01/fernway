"use client";

import { useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { groupByDay } from "@/lib/dates";
import type { Transaction } from "@/types/banking";
import { TransactionDetailSheet } from "./transaction-detail-sheet";
import { TransactionRow } from "./transaction-row";

export function TransactionList({ transactions }: { transactions: Transaction[] }) {
  const [selected, setSelected] = useState<Transaction | null>(null);
  const groups = useMemo(() => groupByDay(transactions), [transactions]);

  return (
    <>
      <div className="flex flex-col gap-4">
        {groups.map((group) => (
          <section key={group.key} aria-label={group.label}>
            <h3 className="mb-1 px-2 text-[0.72rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
              {group.label}
            </h3>
            <ul className="flex flex-col divide-y divide-border/70">
              {group.items.map((transaction) => (
                <li key={transaction.id}>
                  <TransactionRow transaction={transaction} onSelect={setSelected} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <TransactionDetailSheet
        transaction={selected}
        onOpenChange={(open) => !open && setSelected(null)}
      />
    </>
  );
}

export function TransactionListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-1" aria-hidden="true">
      <Skeleton className="mb-2 ml-2 h-3 w-20" />
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex items-center gap-3 px-2 py-2.5">
          <Skeleton className="size-10 rounded-full" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  );
}
