import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { RISK_LABELS } from "@/lib/invest";
import type { Portfolio } from "@/types/invest";

export function PortfolioCard({ portfolio }: { portfolio: Portfolio }) {
  return (
    <Link
      href={`/invest/portfolios/${portfolio.id}`}
      className="group relative flex flex-col overflow-hidden border bg-card outline-none transition-shadow hover:shadow-[0_15px_35px_rgb(26_28_35/0.08)] focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span aria-hidden="true" className="bg-brand-gradient absolute inset-x-0 top-0 z-10 h-[3px] origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100" />
      {portfolio.imageUrl ? (
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={portfolio.imageUrl}
            alt={portfolio.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>
      ) : (
        <div className="bg-brand-gradient/15 flex aspect-[16/9] w-full items-end p-4">
          <span className="font-heading text-xs font-semibold tracking-wider text-muted-foreground uppercase">Lindenway Invest</span>
        </div>
      )}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-heading text-lg font-semibold">{portfolio.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{portfolio.summary}</p>
          </div>
          <Badge variant="outline" className="shrink-0">
            {RISK_LABELS[portfolio.risk]}
          </Badge>
        </div>
        <div className="mt-auto flex items-center justify-between border-t pt-3 text-sm">
          <span className="text-muted-foreground">Pay with BEP-20 USDC</span>
          <span className="inline-flex items-center gap-1 font-medium text-primary">
            View offering
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </span>
        </div>
      </div>
    </Link>
  );
}
