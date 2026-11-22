"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { CoinIcon } from "@/components/shared/coin-icon";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group";
import { CRYPTO_NAMES, CRYPTO_SYMBOLS, WEIGHT_TOTAL } from "@/lib/invest";
import { cn } from "@/lib/utils";
import type { CryptoSymbol, PortfolioAllocation } from "@/types/invest";

interface Props {
  value: PortfolioAllocation[];
  onChange: (next: PortfolioAllocation[]) => void;
}

const toPercentText = (bps: number) => (bps / 100).toString();
const toBps = (text: string) => {
  const parsed = Number.parseFloat(text);
  return Number.isFinite(parsed) ? Math.round(parsed * 100) : 0;
};

/** Mix editor. Percent text is kept locally so "33." can be typed; weights go up as basis points. */
export function AllocationEditor({ value, onChange }: Props) {
  const [text, setText] = useState<Partial<Record<CryptoSymbol, string>>>(() =>
    Object.fromEntries(value.map((item) => [item.symbol, toPercentText(item.weightBps)])),
  );
  const used = new Set(value.map((item) => item.symbol));
  const available = CRYPTO_SYMBOLS.filter((symbol) => !used.has(symbol));
  const total = value.reduce((sum, item) => sum + item.weightBps, 0);
  const complete = total === WEIGHT_TOTAL;

  const setPercent = (symbol: CryptoSymbol, next: string) => {
    if (!/^\d{0,3}(\.\d{0,2})?$/.test(next)) return;
    setText((current) => ({ ...current, [symbol]: next }));
    onChange(value.map((item) => (item.symbol === symbol ? { ...item, weightBps: toBps(next) } : item)));
  };

  return (
    <div className="flex flex-col gap-3">
      {value.length === 0 && <p className="text-sm text-muted-foreground">No coins yet. Add one below.</p>}
      <ul className="flex flex-col gap-2">
        {value.map((item) => (
          <li key={item.symbol} className="flex items-center gap-3">
            <CoinIcon symbol={item.symbol} className="size-8 text-sm" />
            <span className="min-w-0 flex-1 text-sm font-medium">
              {CRYPTO_NAMES[item.symbol]} <span className="text-muted-foreground">{item.symbol}</span>
            </span>
            <InputGroup className="h-9 w-28">
              <InputGroupInput
                value={text[item.symbol] ?? ""}
                onChange={(event) => setPercent(item.symbol, event.target.value)}
                inputMode="decimal"
                aria-label={`${item.symbol} percent`}
                className="text-right tabular-nums"
              />
              <InputGroupAddon align="inline-end">
                <InputGroupText>%</InputGroupText>
              </InputGroupAddon>
            </InputGroup>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Remove ${item.symbol}`}
              onClick={() => onChange(value.filter((entry) => entry.symbol !== item.symbol))}
            >
              <X />
            </Button>
          </li>
        ))}
      </ul>

      {available.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Add coin</span>
          {available.map((symbol) => (
            <Button
              key={symbol}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setText((current) => ({ ...current, [symbol]: "" }));
                onChange([...value, { symbol, weightBps: 0 }]);
              }}
            >
              <Plus data-icon="inline-start" />
              {symbol}
            </Button>
          ))}
        </div>
      )}

      <p className={cn("text-sm font-medium tabular-nums", complete ? "text-credit" : "text-pending")} aria-live="polite">
        Total {(total / 100).toFixed(2)}% {complete ? "" : `· must equal 100% (${total > WEIGHT_TOTAL ? "over" : "short"} by ${(Math.abs(WEIGHT_TOTAL - total) / 100).toFixed(2)}%)`}
      </p>
    </div>
  );
}
