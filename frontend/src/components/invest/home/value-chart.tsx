"use client";

import { useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { QueryError } from "@/components/shared/query-states";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useInvestHistory } from "@/hooks/invest/useInvestHistory";
import { formatMoney } from "@/lib/money";
import type { PriceRange } from "@/types/invest";

const ranges: PriceRange[] = ["1W", "1M", "3M", "1Y"];
const chartConfig = { value: { label: "Value", color: "var(--chart-1)" } } satisfies ChartConfig;

export function ValueChart() {
  const [range, setRange] = useState<PriceRange>("1M");
  const { data: points, isPending, isError, isFetching, refetch } = useInvestHistory(range);
  const data = points?.map((point) => ({ time: point.date, value: point.value / 100 }));

  const tickLabel = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", range === "1W" ? { weekday: "short" } : { month: "short", day: "numeric" });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-base font-semibold">Value over time</CardTitle>
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
      </CardHeader>
      <CardContent>
        {isError ? (
          <QueryError message="We couldn't load your value history." onRetry={() => void refetch()} />
        ) : isPending ? (
          <Skeleton className="h-72 w-full" />
        ) : !data || data.length < 2 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">There isn&apos;t enough history to chart yet.</p>
        ) : (
          <ChartContainer config={chartConfig} className={`aspect-auto h-72 w-full transition-opacity ${isFetching ? "opacity-60" : ""}`}>
            <AreaChart data={data} margin={{ left: 0, right: 4, top: 8 }}>
              <defs>
                <linearGradient id="invest-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-value)" stopOpacity={0.18} />
                  <stop offset="100%" stopColor="var(--color-value)" stopOpacity={0} />
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
                tickFormatter={(value: number) => formatMoney(Math.round(value * 100), "USD", { whole: true })}
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
                    formatter={(value) => <span className="font-medium tabular-nums">{formatMoney(Math.round(Number(value) * 100), "USD")}</span>}
                  />
                }
              />
              <Area dataKey="value" type="monotone" stroke="var(--color-value)" strokeWidth={2} fill="url(#invest-fill)" activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--card)" }} />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
