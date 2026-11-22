"use client";

import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item";
import { formatDayLabel, formatTime } from "@/lib/dates";
import { cn } from "@/lib/utils";
import type { Transaction } from "@/types/banking";
import { Money } from "./money";

const statusLabel = { pending: "Pending", failed: "Failed" } as const;

interface TransactionRowProps {
  transaction: Transaction;
  onSelect?: (transaction: Transaction) => void;
  /** Show the day as well as the time (for lists that are not grouped by day). */
  showDate?: boolean;
}

export function TransactionRow({ transaction, onSelect, showDate = false }: TransactionRowProps) {
  const { direction, status } = transaction;
  const signedAmount = direction === "credit" ? transaction.amount : -(transaction.amount + transaction.fee);
  const moneyIn = direction === "credit";
  const when = showDate
    ? `${formatDayLabel(transaction.createdAt)}, ${formatTime(transaction.createdAt)}`
    : formatTime(transaction.createdAt);

  return (
    <Item asChild size="sm" className="cursor-pointer rounded-md px-3 py-3 hover:bg-muted/70">
      <button type="button" onClick={() => onSelect?.(transaction)} className="text-left">
        <ItemMedia>
          <span
            className={cn(
              "grid size-10 shrink-0 place-items-center rounded-full shadow-[inset_0_-2px_0_rgb(0_0_0/0.12)]",
              moneyIn ? "bg-credit text-white dark:text-background" : "bg-debit text-white dark:text-background",
            )}
          >
            {moneyIn ? <ArrowDownLeft className="size-[18px]" aria-hidden="true" /> : <ArrowUpRight className="size-[18px]" aria-hidden="true" />}
          </span>
        </ItemMedia>
        <ItemContent className="min-w-0 gap-0.5">
          <ItemTitle className="w-full truncate text-[0.95rem]">{transaction.counterparty}</ItemTitle>
          <ItemDescription className="truncate text-[0.8rem]">
            {moneyIn ? "Money in" : "Money out"} · {when}
          </ItemDescription>
        </ItemContent>
        <ItemActions className="flex-col items-end gap-1">
          <Money
            amount={signedAmount}
            currency={transaction.currency}
            signed
            className={cn(
              "font-heading text-[0.95rem] font-semibold",
              direction === "credit" && "text-credit",
              status === "failed" && "text-muted-foreground line-through",
            )}
          />
          {status !== "completed" && (
            <Badge
              variant="outline"
              className={cn(
                "h-5 px-1.5 text-[0.68rem]",
                status === "pending" ? "border-pending/30 text-pending" : "border-debit/30 text-debit",
              )}
            >
              {statusLabel[status]}
            </Badge>
          )}
        </ItemActions>
      </button>
    </Item>
  );
}
