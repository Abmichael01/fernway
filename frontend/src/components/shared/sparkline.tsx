"use client";

import { useId } from "react";
import { Area, AreaChart, XAxis, YAxis } from "recharts";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { siteConfig } from "@/config/site";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";
import { usePreferences } from "@/stores/user/preferences";
import type { CurrencyCode, TrendPoint } from "@/types/banking";

interface SparklineProps {
  points: TrendPoint[];
  /** Names the series in the tooltip. */
  label: string;
  /** Any CSS colour; defaults to the brand primary. */
  color?: string;
  currency?: CurrencyCode;
  /** Show the time as well as the day in the tooltip (for intraday data). */
  withTime?: boolean;
  className?: string;
}

/** A small area chart for a single money series, with a hover tooltip. Values are cents. */
export function Sparkline({
  points,
  label,
  color = "var(--primary)",
  currency = siteConfig.defaultCurrency,
  withTime = false,
  className,
}: SparklineProps) {
  const gradientId = `spark-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const hideBalances = usePreferences((state) => state.hideBalances);
  const config = { value: { label, color } } satisfies ChartConfig;

  const values = points.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  // Breathing room so a flat line does not sit on the card edge.
  const pad = Math.max((max - min) * 0.15, Math.abs(max) * 0.01, 100);

  const dateLabel = (iso: unknown) =>
    typeof iso === "string"
      ? new Date(iso).toLocaleString(siteConfig.locale, {
          month: "short",
          day: "numeric",
          ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
        })
      : "";

  return (
    <ChartContainer config={config} className={cn("aspect-auto h-16 w-full", className)}>
      <AreaChart data={points} margin={{ top: 6, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-value)" stopOpacity={0.3} />
            <stop offset="100%" stopColor="var(--color-value)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="date" hide />
        <YAxis hide domain={[min - pad, max + pad]} />
        <ChartTooltip
          cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
          content={
            <ChartTooltipContent
              hideIndicator
              labelFormatter={(_, payload) => dateLabel(payload?.[0]?.payload?.date)}
              formatter={(value) => (
                <span className="font-heading font-semibold tabular-nums">
                  {hideBalances ? "••••" : formatMoney(Number(value), currency)}
                </span>
              )}
            />
          }
        />
        <Area
          dataKey="value"
          type="monotone"
          stroke="var(--color-value)"
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          isAnimationActive={false}
          activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--card)" }}
        />
      </AreaChart>
    </ChartContainer>
  );
}
