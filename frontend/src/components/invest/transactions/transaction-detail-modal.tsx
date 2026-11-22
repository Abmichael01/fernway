"use client";

import { CoinIcon } from "@/components/shared/coin-icon";
import { CopyButton } from "@/components/shared/copy-button";
import { Money } from "@/components/shared/money";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from "@/components/shared/responsive-modal";
import { formatQuantity } from "@/lib/crypto";
import type { InvestTransaction } from "@/types/invest";
import { formatDate } from "../shared/format";

const statusText = { completed: "Completed", pending: "Pending", failed: "Failed" } as const;

export function TransactionDetailModal({ transaction, onOpenChange }: { transaction: InvestTransaction | null; onOpenChange: (open: boolean) => void }) {
  return (
    <ResponsiveModal open={transaction !== null} onOpenChange={onOpenChange} desktop="sheet">
      <ResponsiveModalContent>
        {transaction && (
          <>
            <ResponsiveModalHeader className="border-b px-6 pt-6 pb-5">
              <ResponsiveModalTitle className="font-heading text-xl">{transaction.description}</ResponsiveModalTitle>
              <ResponsiveModalDescription>
                {transaction.direction === "credit" ? "Money in" : "Money out"} · {statusText[transaction.status]}
              </ResponsiveModalDescription>
            </ResponsiveModalHeader>
            <div className="flex flex-col gap-5 px-6 py-5">
              <dl className="flex flex-col rounded-lg bg-muted/60 px-4 py-1 text-sm">
                <Row label="Amount" value={<Money amount={transaction.amount} currency="USD" className="font-semibold" />} />
                <Row label="Fee" value={<Money amount={transaction.fee} currency="USD" />} />
                {transaction.portfolioName && <Row label="Portfolio" value={transaction.portfolioName} />}
                <Row label="Date" value={formatDate(transaction.occurredAt, true)} />
                <Row
                  label="Reference"
                  value={
                    <span className="flex items-center gap-1">
                      <span className="font-mono text-xs">{transaction.reference}</span>
                      <CopyButton value={transaction.reference} label="Reference" className="size-6" />
                    </span>
                  }
                />
              </dl>
              {transaction.trades.length > 0 && (
                <div className="rounded-lg border">
                  <p className="border-b px-4 py-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">Coins</p>
                  <ul className="divide-y text-sm">
                    {transaction.trades.map((trade, index) => (
                      <li key={`${trade.symbol}-${index}`} className="flex items-center gap-3 px-4 py-3">
                        <CoinIcon symbol={trade.symbol} className="size-8 text-sm" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium">
                            {trade.side === "buy" ? "Bought" : "Sold"} {formatQuantity(trade.quantity, trade.symbol)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            at <Money amount={trade.price} currency="USD" />
                          </p>
                        </div>
                        <Money amount={trade.amount} currency="USD" />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </>
        )}
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-dashed py-2.5 last:border-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}
