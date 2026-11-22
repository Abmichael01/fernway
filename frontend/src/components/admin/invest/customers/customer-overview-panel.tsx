import { Info } from "lucide-react";
import { Money } from "@/components/shared/money";
import { CoinIcon } from "@/components/shared/coin-icon";
import { Card, CardContent } from "@/components/ui/card";
import { formatPercent } from "@/lib/crypto";
import { formatQuantity } from "@/lib/crypto";
import { cn } from "@/lib/utils";
import type { HoldingLine, InvestOverview } from "@/types/invest";

function Holdings({ lines }: { lines: HoldingLine[] }) {
  return (
    <ul className="divide-y">
      {lines.map((line) => (
        <li key={line.symbol} className="flex items-center gap-3 py-2.5">
          <CoinIcon symbol={line.symbol} className="size-8 text-sm" />
          <span className="min-w-0 flex-1">
            <span className="block font-medium">{line.name}</span>
            <span className="block text-xs text-muted-foreground tabular-nums">{formatQuantity(line.quantity, line.symbol)}</span>
          </span>
          <span className="text-right">
            <Money amount={line.value} currency="USD" className="block font-medium" />
            <span className="block text-xs text-muted-foreground">
              Cost <Money amount={line.cost} currency="USD" />
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Read-only view of what a customer holds. Nothing here can be edited. */
export function CustomerOverviewPanel({ overview }: { overview: InvestOverview }) {
  const gain = overview.invested - overview.cost;
  const figures = [
    { label: "Investing cash", node: <Money amount={overview.cash} currency="USD" /> },
    { label: "Invested", node: <Money amount={overview.invested} currency="USD" /> },
    {
      label: "Gain or loss",
      node: <Money amount={gain} currency="USD" signed className={cn(gain > 0 && "text-credit", gain < 0 && "text-debit")} />,
    },
    { label: "Total", node: <Money amount={overview.total} currency="USD" /> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {figures.map((figure) => (
          <Card key={figure.label}>
            <CardContent className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">{figure.label}</span>
              <span className="font-figure text-2xl font-semibold tracking-tight">{figure.node}</span>
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="flex gap-2 text-sm text-muted-foreground">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <span>
          Balances come only from confirmed deposits, trades and withdrawals. They can&apos;t be edited.
          {!overview.pricesLive && " Prices are offline, so values are approximate."}
        </span>
      </p>

      <section className="flex flex-col gap-3">
        <h3 className="font-heading text-base font-semibold">Portfolios</h3>
        {overview.portfolios.length === 0 ? (
          <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">Not invested in any portfolio.</p>
        ) : (
          overview.portfolios.map((position) => (
            <Card key={position.portfolio.id}>
              <CardContent className="flex flex-col gap-2">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-heading font-semibold">{position.portfolio.name}</span>
                  <span className="text-sm text-muted-foreground">
                    Value <Money amount={position.value} currency="USD" className="font-medium text-foreground" /> · 24h{" "}
                    {formatPercent(position.portfolio.change24h)}
                  </span>
                </div>
                <Holdings lines={position.holdings} />
              </CardContent>
            </Card>
          ))
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="font-heading text-base font-semibold">Coins bought directly</h3>
        {overview.direct.length === 0 ? (
          <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">No direct holdings.</p>
        ) : (
          <Card>
            <CardContent>
              <Holdings lines={overview.direct} />
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
