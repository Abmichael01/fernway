import { CoinIcon } from "@/components/shared/coin-icon";
import { cn } from "@/lib/utils";
import type { PortfolioAllocation } from "@/types/invest";
import { COIN_COLORS } from "./format";

const pct = (bps: number) => `${(bps / 100).toLocaleString("en-US", { maximumFractionDigits: 2 })}%`;

export function AllocationBar({ allocations, className }: { allocations: PortfolioAllocation[]; className?: string }) {
  return (
    <div
      role="img"
      aria-label={allocations.map((a) => `${a.symbol} ${pct(a.weightBps)}`).join(", ")}
      className={cn("flex h-2.5 w-full gap-0.5 overflow-hidden rounded-full", className)}
    >
      {allocations.map((a) => (
        <span key={a.symbol} style={{ width: `${a.weightBps / 100}%`, backgroundColor: COIN_COLORS[a.symbol] }} />
      ))}
    </div>
  );
}

export function AllocationLegend({ allocations, className }: { allocations: PortfolioAllocation[]; className?: string }) {
  return (
    <ul className={cn("flex flex-wrap gap-x-4 gap-y-2 text-sm", className)}>
      {allocations.map((a) => (
        <li key={a.symbol} className="flex items-center gap-1.5">
          <CoinIcon symbol={a.symbol} className="size-5 text-[0.65rem]" />
          <span className="font-medium">{a.symbol}</span>
          <span className="text-muted-foreground tabular-nums">{pct(a.weightBps)}</span>
        </li>
      ))}
    </ul>
  );
}

export { pct as formatWeight };
