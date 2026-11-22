"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { QueryError } from "@/components/shared/query-states";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCryptoAssets } from "@/hooks/crypto/useCrypto";
import type { CryptoSymbol, TradeSide } from "@/types/banking";
import { HoldingsTable } from "./holdings-table";
import { PortfolioSummary } from "./portfolio-summary";
import { PriceChart } from "./price-chart";
import { TradeSheet } from "./trade-sheet";

export function CryptoView() {
  const { data: assets, isPending, isError, refetch } = useCryptoAssets();
  const [selected, setSelected] = useState<CryptoSymbol>("BTC");
  const [trade, setTrade] = useState<{ side: TradeSide; symbol: CryptoSymbol } | null>(null);

  if (isError) return <QueryError message="We couldn't load crypto prices." onRetry={() => void refetch()} />;
  if (isPending) {
    return (
      <div className="flex flex-col gap-6" aria-hidden="true">
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  const asset = assets.find((item) => item.symbol === selected) ?? assets[0];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PortfolioSummary assets={assets} />
        <div className="flex gap-2">
          <Button size="lg" onClick={() => setTrade({ side: "buy", symbol: asset.symbol })}>
            <Plus data-icon="inline-start" />
            Buy
          </Button>
          <Button size="lg" variant="outline" className="bg-card" onClick={() => setTrade({ side: "sell", symbol: asset.symbol })}>
            <Minus data-icon="inline-start" />
            Sell
          </Button>
        </div>
      </div>
      <PriceChart asset={asset} />
      <HoldingsTable
        assets={assets}
        selected={asset.symbol}
        onSelect={setSelected}
        onTrade={(side, symbol) => setTrade({ side, symbol })}
      />
      <TradeSheet trade={trade} assets={assets} onOpenChange={(open) => !open && setTrade(null)} />
    </div>
  );
}
