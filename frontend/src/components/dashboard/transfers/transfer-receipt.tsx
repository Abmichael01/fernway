"use client";

import Link from "next/link";
import { Guilloche } from "@/components/shared/guilloche";
import { Money } from "@/components/shared/money";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateTime } from "@/lib/dates";
import type { Transaction } from "@/types/banking";

interface TransferReceiptProps {
  transaction: Transaction;
  onDone: () => void;
}

export function TransferReceipt({ transaction, onDone }: TransferReceiptProps) {
  const isInternal = transaction.channel === "internal";
  const rows: Array<[string, React.ReactNode]> = [
    ["To", transaction.counterparty],
    ...(transaction.counterpartyDetail ? [["Account", transaction.counterpartyDetail] as [string, React.ReactNode]] : []),
    ["Memo", transaction.narration],
    ["Fee", <Money key="fee" amount={transaction.fee} currency={transaction.currency} />],
    ["Date", formatDateTime(transaction.createdAt)],
    ["Reference", <span key="ref" className="tabular-nums">{transaction.reference}</span>],
  ];

  return (
    <Card className="mx-auto w-full max-w-lg gap-0 py-0">
      <div className="relative isolate overflow-hidden bg-brand px-6 pt-10 pb-8 text-center text-brand-foreground">
        <Guilloche
          variant="card"
          className="absolute top-1/2 left-1/2 -z-10 size-[28rem] -translate-x-1/2 -translate-y-1/2 text-brass opacity-70"
        />
        <Badge variant="outline" className="border-white/30 text-brand-foreground">
          {transaction.status === "pending" ? "Pending" : isInternal ? "Moved" : "Sent"}
        </Badge>
        <p className="mt-3 font-heading text-4xl font-bold tracking-tight sm:text-5xl">
          <Money amount={transaction.amount} currency={transaction.currency} />
        </p>
        <p className="mt-2 text-sm text-brand-foreground/80">to {transaction.counterparty}</p>
        {transaction.status === "pending" && (
          <p className="mt-2 text-xs text-brand-foreground/75">
            Please wait while your transaction is being completed.
          </p>
        )}
      </div>
      <CardContent className="py-4">
        <dl className="flex flex-col text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-6 border-b border-dashed py-3 last:border-0">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="text-right font-medium">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Button size="lg" className="h-11 flex-1" onClick={onDone}>
            Make another transfer
          </Button>
          <Button asChild size="lg" variant="outline" className="h-11 flex-1">
            <Link href="/overview">Back to overview</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
