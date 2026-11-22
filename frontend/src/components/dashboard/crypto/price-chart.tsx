"use client";

import { useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChangeBadge } from "@/components/shared/change-badge";
import { CoinIcon } from "@/components/shared/coin-icon";
import { Money } from "@/components/shared/money";
import { QueryError } from "@/components/shared/query-states";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { usePriceHistory } from "@/hooks/crypto/useCrypto";
import { formatMoney } from "@/lib/money";
import type { CryptoAsset, PriceRange } from "@/types/banking";

const ranges: PriceRange[] = ["1W", "1M", "3M", "1Y"];
const rangeNames: Record<PriceRange, string> = { "1W": "past week", "1M": "past month", "3M": "past 3 months", "1Y": "past year" };

const chartConfig = { price: { label: "Price", color: "var(--chart-1)" } } satisfies ChartConfig;

export function PriceChart({ asset }: { asset: CryptoAsset }) {
  const [range, setRange] = useState<PriceRange>("1M");
  const { data: points, isPending, isError, isFetching, refetch } = usePriceHistory(asset.symbol, range);

  const data = points?.map((point) => ({ time: point.time, price: point.price / 100 }));
  const first = points?.[0]?.price;
  const last = points?.at(-1)?.price;
  const change = first && last ? last / first - 1 : 0;

  const tickLabel = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", range === "1W" ? { weekday: "short" } : { month: "short", day: "numeric" });

  return (
    <Card>
      <CardHeader className="gap-3">
        <div className="flex items-center gap-3">
          <CoinIcon symbol={asset.symbol} />
          <div>
            <CardTitle className="font-heading text-base font-semibold">{asset.name}</CardTitle>
            <CardDescription>{asset.symbol}</CardDescription>
          </div>
        </div>
        <CardAction>
          <ToggleGroup
            type="single"
            variant="outline"
            size="sm"
            value={range}
            onValueChange={(value) => value && setRange(value as PriceRange)}
            aria-label="Chart range"
          >
            {ranges.map((item) => (
              <ToggleGroupItem key={item} value={item} className="px-3">
                {item}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </CardAction>
        <div className="col-span-full flex flex-wrap items-center gap-3">
          <Money amount={asset.price} currency="USD" className="font-heading text-3xl font-bold tracking-tight" />
          {points && <ChangeBadge value={change} />}
          <span className="text-sm text-muted-foreground">{rangeNames[range]}</span>
        </div>
      </CardHeader>
      <CardContent>
        {isError ? (
          <QueryError message="We couldn't load the price history." onRetry={() => void refetch()} />
        ) : isPending ? (
          <Skeleton className="h-72 w-full" />
        ) : (
          <ChartContainer
            config={chartConfig}
            className={`aspect-auto h-72 w-full transition-opacity ${isFetching ? "opacity-60" : ""}`}
          >
            <AreaChart data={data} margin={{ left: 0, right: 4, top: 8 }}>
              <defs>
                <linearGradient id="price-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-price)" stopOpacity={0.14} />
                  <stop offset="100%" stopColor="var(--color-price)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="var(--border)" />
              <XAxis dataKey="time" tickLine={false} axisLine={false} tickMargin={8} minTickGap={40} tickFormatter={tickLabel} />
              <YAxis
                domain={["auto", "auto"]}
                tickCount={5}
                tickLine={false}
                axisLine={false}
                width={72}
                tickFormatter={(value: number) => formatMoney(Math.round(value * 100), "USD", { whole: value >= 100 })}
              />
              <ChartTooltip
                cursor={{ stroke: "var(--muted-foreground)", strokeWidth: 1 }}
                content={
                  <ChartTooltipContent
                    hideIndicator
                    labelFormatter={(_, payload) =>
                      new Date(String(payload?.[0]?.payload?.time)).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: range === "1W" ? "numeric" : undefined,
                      })
                    }
                    formatter={(value) => (
                      <span className="font-medium tabular-nums">{formatMoney(Math.round(Number(value) * 100), "USD")}</span>
                    )}
                  />
                }
              />
              <Area
                dataKey="price"
                type="monotone"
                stroke="var(--color-price)"
                strokeWidth={2}
                fill="url(#price-fill)"
                activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--card)" }}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
