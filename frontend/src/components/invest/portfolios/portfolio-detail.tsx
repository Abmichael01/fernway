"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Calendar, CheckCircle2, Coins, ShieldCheck, Sparkles, TrendingUp, Wallet } from "lucide-react";
import { ChangeBadge } from "@/components/shared/change-badge";
import { CoinIcon } from "@/components/shared/coin-icon";
import { Money } from "@/components/shared/money";
import { QueryError } from "@/components/shared/query-states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ItemGroup } from "@/components/ui/item";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useInvestOverview } from "@/hooks/invest/useInvestOverview";
import { usePortfolio } from "@/hooks/invest/usePortfolio";
import { CRYPTO_NAMES, RISK_LABELS } from "@/lib/invest";
import { cn } from "@/lib/utils";
import { AllocationBar, formatWeight } from "../shared/allocation-bar";
import { GainLoss } from "../shared/gain-loss";
import { HoldingRow } from "../shared/holding-row";
import { PricesWarning } from "../shared/prices-warning";
import { PortfolioTradeModal } from "./portfolio-trade-modal";

const PRESET_AMOUNTS_CENTS = [10_000, 50_000, 100_000, 500_000] as const;

export function PortfolioDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      <Skeleton className="h-5 w-32" />
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="flex flex-col gap-6 lg:col-span-7">
          <Skeleton className="aspect-[16/10] w-full rounded-2xl" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
          </div>
          <Skeleton className="h-44 rounded-xl" />
        </div>
        <div className="lg:col-span-5">
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

export function PortfolioDetail({ id }: { id: string }) {
  const portfolioQuery = usePortfolio(id);
  const overview = useInvestOverview();
  const [modal, setModal] = useState<"buy" | "sell" | null>(null);
  const [previewCents, setPreviewCents] = useState<number>(50_000);

  if (portfolioQuery.isError) {
    return (
      <div className="flex flex-col gap-4">
        <BackLink />
        <QueryError message="We couldn't load this investment offering." onRetry={() => void portfolioQuery.refetch()} />
      </div>
    );
  }
  if (portfolioQuery.isPending) return <PortfolioDetailSkeleton />;

  const portfolio = portfolioQuery.data;
  const position = overview.data?.portfolios.find((item) => item.portfolio.id === id);
  const holds = (position?.value ?? 0) > 0;
  const paused = overview.data ? !overview.data.pricesLive : false;
  const isStandardOffering =
    portfolio.allocations.length === 0 ||
    (portfolio.allocations.length === 1 && portfolio.allocations[0]?.symbol === "USDC");

  const hasAutoDaily = portfolio.autoDailyEnabled && (portfolio.dailyFixedCents > 0 || portfolio.dailyRateBps > 0);
  const dailyRateLabel = hasAutoDaily
    ? [
        portfolio.dailyFixedCents > 0 ? `$${(portfolio.dailyFixedCents / 100).toFixed(2)}/day` : "",
        portfolio.dailyRateBps > 0 ? `${(portfolio.dailyRateBps / 100).toFixed(2)}%/day` : "",
      ]
        .filter(Boolean)
        .join(" + ")
    : "Admin reported";

  const estimatedDailyCents = hasAutoDaily
    ? portfolio.dailyFixedCents + Math.round((previewCents * portfolio.dailyRateBps) / 10_000)
    : 0;
  const estimatedMonthlyCents = estimatedDailyCents * 30;

  return (
    <div className="flex flex-col gap-6">
      {/* Top breadcrumb & live offering status */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <BackLink />
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-xs font-medium">
            <span className="size-2 rounded-full bg-emerald-500" aria-hidden="true" />
            Open for investment
          </span>
          <Badge variant="outline">{RISK_LABELS[portfolio.risk]}</Badge>
          {!isStandardOffering && <ChangeBadge value={portfolio.change24h} />}
        </div>
      </div>

      {/* Main asymmetric 2-column layout (7 / 5) */}
      <div className="grid items-start gap-8 lg:grid-cols-12">
        {/* Left Main Column: Visual + Metrics + Narrative + Position */}
        <div className="flex flex-col gap-6 lg:col-span-7">
          {/* Framed Visual Hero */}
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border bg-muted shadow-sm">
            {portfolio.imageUrl ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={portfolio.imageUrl} alt={portfolio.name} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
              </>
            ) : (
              <div className="bg-brand-gradient h-full w-full opacity-90" />
            )}
            <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-5 text-white sm:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-medium backdrop-blur-md">
                  {RISK_LABELS[portfolio.risk]}
                </span>
                <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-medium backdrop-blur-md">
                  BEP-20 USDC
                </span>
              </div>
              <h1 className="font-heading text-2xl font-semibold tracking-tight text-white sm:text-3xl">{portfolio.name}</h1>
              <p className="max-w-xl text-sm text-white/85">{portfolio.summary}</p>
            </div>
          </div>

          {paused && !isStandardOffering && <PricesWarning />}

          {/* 4-Tile Key Metrics Bar */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MetricTile icon={TrendingUp} label="Daily earning" value={dailyRateLabel} accent={hasAutoDaily} />
            <MetricTile icon={ShieldCheck} label="Risk profile" value={RISK_LABELS[portfolio.risk]} />
            <MetricTile icon={Wallet} label="Minimum" value="$10.00" />
            <MetricTile icon={Coins} label="Payment rail" value="BEP-20 USDC" />
          </div>

          {/* Offering Overview & Highlights */}
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="font-heading text-lg font-semibold">Offering overview</CardTitle>
              <CardDescription>Strategy, settlement, and how daily returns are credited.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              {portfolio.description ? (
                <p className="text-sm leading-relaxed text-foreground/85">{portfolio.description}</p>
              ) : (
                <p className="text-sm leading-relaxed text-muted-foreground">{portfolio.summary}</p>
              )}
              <ul className="grid gap-3 border-t pt-4 text-sm sm:grid-cols-2">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                  <span className="text-muted-foreground">
                    <strong className="font-medium text-foreground">USD-denominated value</strong> — track principal and earnings cleanly in dollars.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                  <span className="text-muted-foreground">
                    <strong className="font-medium text-foreground">BEP-20 crypto checkout</strong> — pay directly via BNB Smart Chain or Investing Cash.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                  <span className="text-muted-foreground">
                    <strong className="font-medium text-foreground">Daily earnings</strong> —{" "}
                    {hasAutoDaily ? "credited automatically every day to your balance." : "recorded daily by fund operations."}
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                  <span className="text-muted-foreground">
                    <strong className="font-medium text-foreground">Transparent ledger</strong> — every investment and payout is logged in Transactions.
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Legacy multi-coin breakdown if applicable */}
          {!isStandardOffering && (
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="font-heading text-base font-semibold">What it holds</CardTitle>
                <CardDescription>Share of each asset, split by these weights.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <AllocationBar allocations={portfolio.allocations} />
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Asset</TableHead>
                      <TableHead className="text-right">Share</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {portfolio.allocations.map((allocation) => (
                      <TableRow key={allocation.symbol}>
                        <TableCell>
                          <span className="flex items-center gap-2.5">
                            <CoinIcon symbol={allocation.symbol} className="size-7 text-xs" />
                            <span className="font-medium">{CRYPTO_NAMES[allocation.symbol]}</span>
                            <span className="text-muted-foreground">{allocation.symbol}</span>
                          </span>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{formatWeight(allocation.weightBps)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Customer Position */}
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="font-heading text-lg font-semibold">Your position</CardTitle>
              <CardDescription>Your active principal and holdings in this offering.</CardDescription>
            </CardHeader>
            <CardContent>
              {overview.isPending ? (
                <Skeleton className="h-28" />
              ) : overview.isError ? (
                <QueryError message="We couldn't load your position." onRetry={() => void overview.refetch()} />
              ) : position && holds ? (
                <div className="flex flex-col gap-4">
                  <dl className="grid grid-cols-3 gap-3 rounded-xl bg-muted/40 p-4 text-sm">
                    <div>
                      <dt className="text-muted-foreground">Current value</dt>
                      <dd className="font-figure mt-0.5 text-lg font-semibold">
                        <Money amount={position.value} currency="USD" />
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Invested</dt>
                      <dd className="font-figure mt-0.5 text-lg font-semibold">
                        <Money amount={position.cost} currency="USD" />
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Gain or loss</dt>
                      <dd className="font-figure mt-0.5 text-lg font-semibold">
                        <GainLoss value={position.value} cost={position.cost} />
                      </dd>
                    </div>
                  </dl>
                  {!isStandardOffering && (
                    <ItemGroup>
                      {position.holdings.map((holding) => (
                        <HoldingRow key={holding.symbol} holding={holding} />
                      ))}
                    </ItemGroup>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between gap-4 rounded-xl border border-dashed p-5">
                  <p className="text-sm text-muted-foreground">You haven&apos;t invested in this offering yet.</p>
                  <Button size="sm" variant="outline" onClick={() => setModal("buy")} disabled={!overview.data}>
                    Get started
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Sticky Conversion Sidebar */}
        <aside className="lg:sticky lg:top-24 lg:col-span-5">
          <Card className="relative overflow-hidden rounded-2xl shadow-md">
            <span aria-hidden="true" className="bg-brand-gradient absolute inset-x-0 top-0 h-1" />
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="font-heading text-lg font-semibold">Invest in this offering</CardTitle>
                {hasAutoDaily && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    <Sparkles className="size-3" aria-hidden="true" />
                    Auto daily
                  </span>
                )}
              </div>
              <CardDescription>Fund with BEP-20 USDC or your Investing Cash.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              {/* Quick estimator */}
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                  <span>Quick estimate</span>
                  <span>
                    Cash:{" "}
                    {overview.data ? (
                      <strong className="text-foreground">
                        <Money amount={overview.data.cash} currency="USD" />
                      </strong>
                    ) : (
                      "—"
                    )}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {PRESET_AMOUNTS_CENTS.map((cents) => {
                    const active = previewCents === cents;
                    return (
                      <button
                        key={cents}
                        type="button"
                        onClick={() => setPreviewCents(cents)}
                        className={cn(
                          "font-figure rounded-lg border py-2 text-xs font-semibold transition-colors",
                          active
                            ? "border-primary bg-primary/10 text-primary"
                            : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
                        )}
                      >
                        ${(cents / 100).toLocaleString()}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Projected return summary */}
              <div className="flex flex-col gap-2.5 rounded-xl border bg-muted/35 p-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Investment amount</span>
                  <span className="font-figure font-semibold">
                    <Money amount={previewCents} currency="USD" />
                  </span>
                </div>
                {hasAutoDaily ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Estimated daily earning</span>
                      <span className="font-figure font-semibold text-emerald-600 dark:text-emerald-400">
                        +<Money amount={estimatedDailyCents} currency="USD" /> / day
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-t pt-2.5">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="size-3.5" aria-hidden="true" /> 30-day projection
                      </span>
                      <span className="font-figure font-semibold text-foreground">
                        +<Money amount={estimatedMonthlyCents} currency="USD" />
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-between border-t pt-2.5">
                    <span className="text-muted-foreground">Earnings schedule</span>
                    <span className="font-medium text-foreground">Daily admin payouts</span>
                  </div>
                )}
              </div>

              {/* Primary & secondary CTAs */}
              <div className="flex flex-col gap-2.5">
                <Button size="lg" className="h-12 w-full text-base font-semibold" onClick={() => setModal("buy")} disabled={!overview.data}>
                  Invest now
                  <ArrowUpRight className="size-4" data-icon="inline-end" aria-hidden="true" />
                </Button>
                {holds && (
                  <Button size="lg" variant="outline" className="h-11 w-full" onClick={() => setModal("sell")}>
                    Withdraw funds
                  </Button>
                )}
              </div>

              {/* Trust & settlement footer */}
              <div className="flex flex-col gap-2 border-t pt-4 text-xs text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Payment network</span>
                  <span className="font-medium text-foreground">BNB Smart Chain (BEP-20)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Minimum investment</span>
                  <span className="font-medium text-foreground">$10.00</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Settlement currency</span>
                  <span className="font-medium text-foreground">USD</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>

      {overview.data && (
        <PortfolioTradeModal
          portfolio={portfolio}
          side={modal}
          cash={overview.data.cash}
          positionValue={position?.value ?? 0}
          paused={paused}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

function MetricTile({
  icon: Icon,
  label,
  value,
  accent = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-xl border bg-card p-3.5">
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="size-3.5 text-primary" aria-hidden="true" />
        {label}
      </span>
      <span className={cn("font-figure text-sm font-semibold", accent && "text-emerald-600 dark:text-emerald-400")}>{value}</span>
    </div>
  );
}

function BackLink() {
  return (
    <Link href="/invest/portfolios" className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
      <ArrowLeft className="size-4" aria-hidden="true" />
      Investments
    </Link>
  );
}
