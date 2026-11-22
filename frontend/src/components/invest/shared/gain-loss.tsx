import { Money } from "@/components/shared/money";
import { formatPercent } from "@/lib/crypto";
import { cn } from "@/lib/utils";
import { gainLoss } from "./format";

/** "+$12.00 (+1.20%)" coloured by direction; direction is also in the sign. */
export function GainLoss({ value, cost, className }: { value: number; cost: number; className?: string }) {
  const { amount, fraction } = gainLoss(value, cost);
  return (
    <span className={cn("tabular-nums", amount > 0 && "text-credit", amount < 0 && "text-debit", className)}>
      <Money amount={amount} currency="USD" signed />
      {cost > 0 && <span> ({formatPercent(fraction)})</span>}
    </span>
  );
}
