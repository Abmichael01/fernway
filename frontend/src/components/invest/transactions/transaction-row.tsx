import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { Money } from "@/components/shared/money";
import { Badge } from "@/components/ui/badge";
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item";
import { cn } from "@/lib/utils";
import type { InvestTransaction } from "@/types/invest";
import { formatDate } from "../shared/format";

export function TransactionRow({ transaction, onSelect }: { transaction: InvestTransaction; onSelect: () => void }) {
  const credit = transaction.direction === "credit";
  const Icon = credit ? ArrowDownLeft : ArrowUpRight;
  return (
    <Item asChild className="px-0 py-3">
      <button type="button" onClick={onSelect} className="cursor-pointer text-left">
        <ItemMedia>
          <span className={cn("grid size-10 place-items-center rounded-full", credit ? "bg-credit/10 text-credit" : "bg-muted text-foreground")}>
            <Icon className="size-5" aria-hidden="true" />
          </span>
        </ItemMedia>
        <ItemContent>
          <ItemTitle>
            {transaction.description}
            {transaction.status !== "completed" && (
              <Badge variant={transaction.status === "failed" ? "destructive" : "outline"}>{transaction.status === "failed" ? "Failed" : "Pending"}</Badge>
            )}
          </ItemTitle>
          <ItemDescription>
            {credit ? "Money in" : "Money out"}
            {transaction.portfolioName ? ` · ${transaction.portfolioName}` : ""} · {formatDate(transaction.occurredAt)}
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <span className={cn("font-medium tabular-nums", credit && "text-credit", transaction.status === "failed" && "line-through opacity-60")}>
            {credit ? "+" : "−"}
            <Money amount={transaction.amount} currency="USD" />
          </span>
        </ItemActions>
      </button>
    </Item>
  );
}
