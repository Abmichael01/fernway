import { TrendingDown, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatPercent } from "@/lib/crypto";
import { cn } from "@/lib/utils";

/** Percentage change with an arrow, so direction never relies on colour alone. */
export function ChangeBadge({ value, className }: { value: number; className?: string }) {
  const up = value >= 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1 tabular-nums",
        up ? "border-credit/25 bg-credit/5 text-credit" : "border-debit/25 bg-debit/5 text-debit",
        className,
      )}
    >
      <Icon aria-hidden="true" />
      {formatPercent(value)}
    </Badge>
  );
}
