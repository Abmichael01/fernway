"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { QueryError } from "@/components/shared/query-states";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { siteConfig } from "@/config/site";
import { useCashFlow } from "@/hooks/transactions/useInsights";
import { formatMoney } from "@/lib/money";

const WEEKS = 12;

const chartConfig = {
  moneyIn: { label: "Money in", color: "var(--chart-1)" },
  moneyOut: { label: "Money out", color: "var(--chart-2)" },
} satisfies ChartConfig;

const weekLabel = (iso: string) =>
  new Date(iso).toLocaleDateString(siteConfig.locale, { month: "short", day: "numeric" });

const axisDollars = (value: number) =>
  value >= 1000 ? `$${(value / 1000).toLocaleString("en-US", { maximumFractionDigits: 1 })}K` : `$${value}`;

export function CashFlowChart() {
  const { data: weeks, isPending, isError, refetch } = useCashFlow(WEEKS);

  // Recharts plots whole dollars; values stay in cents everywhere else.
  const data = weeks?.map((week) => ({
    week: weekLabel(week.weekStart),
    moneyIn: Math.round(week.moneyIn / 100),
    moneyOut: Math.round(week.moneyOut / 100),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-base font-semibold">Cash flow</CardTitle>
        <CardDescription>Money in and out each week, last {WEEKS} weeks</CardDescription>
      </CardHeader>
      <CardContent>
        {isError ? (
          <QueryError message="We couldn't load your cash flow." onRetry={() => void refetch()} />
        ) : isPending ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <>
            <ChartContainer config={chartConfig} className="aspect-auto h-64 w-full">
              <AreaChart data={data} margin={{ left: 0, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="cashflow-in" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-moneyIn)" stopOpacity={0.32} />
                    <stop offset="100%" stopColor="var(--color-moneyIn)" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="cashflow-out" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-moneyOut)" stopOpacity={0.32} />
                    <stop offset="100%" stopColor="var(--color-moneyOut)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis dataKey="week" tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} />
                <YAxis tickLine={false} axisLine={false} width={48} tickFormatter={axisDollars} />
                <ChartTooltip
                  cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => (
                        <div className="flex w-full items-center gap-2">
                          <span
                            className="size-2.5 shrink-0 rounded-[2px]"
                            style={{ background: `var(--color-${String(name)})` }}
                          />
                          <span className="text-muted-foreground">
                            {chartConfig[name as keyof typeof chartConfig]?.label}
                          </span>
                          <span className="ml-auto font-medium tabular-nums">
                            {formatMoney(Number(value) * 100, siteConfig.defaultCurrency, { whole: true })}
                          </span>
                        </div>
                      )}
                    />
                  }
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Area
                  dataKey="moneyIn"
                  type="monotone"
                  stroke="var(--color-moneyIn)"
                  strokeWidth={2}
                  fill="url(#cashflow-in)"
                  activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--card)" }}
                />
                <Area
                  dataKey="moneyOut"
                  type="monotone"
                  stroke="var(--color-moneyOut)"
                  strokeWidth={2}
                  fill="url(#cashflow-out)"
                  activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--card)" }}
                />
              </AreaChart>
            </ChartContainer>
            <table className="sr-only">
              <caption>Weekly cash flow</caption>
              <thead>
                <tr>
                  <th scope="col">Week of</th>
                  <th scope="col">Money in</th>
                  <th scope="col">Money out</th>
                </tr>
              </thead>
              <tbody>
                {weeks.map((week) => (
                  <tr key={week.weekStart}>
                    <th scope="row">{weekLabel(week.weekStart)}</th>
                    <td>{formatMoney(week.moneyIn, siteConfig.defaultCurrency)}</td>
                    <td>{formatMoney(week.moneyOut, siteConfig.defaultCurrency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </CardContent>
    </Card>
  );
}
