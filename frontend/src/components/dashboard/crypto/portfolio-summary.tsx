"use client";

import { MoneyFigure } from "@/components/shared/money";
import { ChangeBadge } from "@/components/shared/change-badge";
import { Money } from "@/components/shared/money";
import { holdingValue } from "@/lib/crypto";
import type { CryptoAsset } from "@/types/banking";

export function PortfolioSummary({ assets }: { assets: CryptoAsset[] }) {
  const value = assets.reduce((sum, asset) => sum + holdingValue(asset), 0);
  const cost = assets.reduce((sum, asset) => sum + Math.round(asset.holding * asset.averageCost), 0);
  const gain = value - cost;

  return (
    <div className="flex flex-col gap-1">
      <p className="text-sm text-muted-foreground">Portfolio value</p>
      <MoneyFigure amount={value} currency="USD" className="text-4xl font-bold sm:text-5xl" />
      <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Money amount={gain} currency="USD" signed sensitive className="font-medium text-foreground" />
        {cost > 0 && <ChangeBadge value={gain / cost} />}
        all-time return
      </p>
    </div>
  );
}
