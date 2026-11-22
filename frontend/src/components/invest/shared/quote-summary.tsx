import { Money } from "@/components/shared/money";
import { Skeleton } from "@/components/ui/skeleton";
import { formatQuantity } from "@/lib/crypto";
import type { InvestQuote } from "@/types/invest";

interface QuoteSummaryProps {
  side: "buy" | "sell";
  quote: InvestQuote | undefined;
  loading: boolean;
  /** Message when the server refused to quote (e.g. prices paused). */
  error?: string | null;
}

/** Shows the server's quote exactly as given. */
export function QuoteSummary({ side, quote, loading, error }: QuoteSummaryProps) {
  return (
    <div className="flex flex-col gap-3" aria-live="polite">
      <dl className="flex flex-col rounded-lg bg-muted/60 px-4 py-1 text-sm">
        <Row label="Amount" value={quote ? <Money amount={quote.amount} currency="USD" /> : loading ? <Skeleton className="h-4 w-16" /> : "—"} />
        <Row label="Fee" value={quote ? <Money amount={quote.fee} currency="USD" /> : loading ? <Skeleton className="h-4 w-12" /> : "—"} />
        <Row
          label={side === "buy" ? "Goes into coins" : "You receive"}
          value={quote ? <Money amount={quote.net} currency="USD" className="font-semibold" /> : loading ? <Skeleton className="h-4 w-16" /> : "—"}
        />
      </dl>
      {quote && quote.legs.length > 0 && (
        <div className="rounded-lg border">
          <p className="border-b px-4 py-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {side === "buy" ? "You get" : "You sell"}
          </p>
          <ul className="divide-y text-sm">
            {quote.legs.map((leg) => (
              <li key={leg.symbol} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <div className="min-w-0">
                  <p className="font-medium tabular-nums">{formatQuantity(leg.quantity, leg.symbol)}</p>
                  <p className="text-xs text-muted-foreground">
                    at <Money amount={leg.price} currency="USD" />
                  </p>
                </div>
                <Money amount={leg.amount} currency="USD" />
              </li>
            ))}
          </ul>
        </div>
      )}
      {error && <p className="text-sm text-debit">{error}</p>}
    </div>
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
