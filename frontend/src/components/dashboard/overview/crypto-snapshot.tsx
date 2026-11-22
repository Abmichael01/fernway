"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ChangeBadge } from "@/components/shared/change-badge";
import { CoinIcon } from "@/components/shared/coin-icon";
import { Money } from "@/components/shared/money";
import { QueryError } from "@/components/shared/query-states";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@/components/ui/item";
import { Skeleton } from "@/components/ui/skeleton";
import { useCryptoAssets } from "@/hooks/crypto/useCrypto";
import { holdingValue } from "@/lib/crypto";

export function CryptoSnapshot() {
  const { data: assets, isPending, isError, refetch } = useCryptoAssets();
  const total = assets?.reduce((sum, asset) => sum + holdingValue(asset), 0) ?? 0;
  const volatile = assets?.filter((asset) => asset.symbol !== "USDC").slice(0, 3) ?? [];

  return (
    <Card className="gap-2">
      <CardHeader>
        <CardTitle className="font-heading text-base font-semibold">Crypto</CardTitle>
        <CardDescription>
          {assets ? <Money amount={total} currency="USD" sensitive className="font-medium text-foreground" /> : "Portfolio"}
        </CardDescription>
        <CardAction>
          <Button asChild variant="ghost" size="sm">
            <Link href="/crypto">
              Trade
              <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2">
        {isError ? (
          <QueryError message="We couldn't load crypto prices." onRetry={() => void refetch()} className="mx-2" />
        ) : isPending ? (
          <div className="flex flex-col gap-2 px-2" aria-hidden="true">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <ItemGroup>
            {volatile.map((asset) => (
              <Item key={asset.symbol} size="sm" className="px-2">
                <ItemMedia>
                  <CoinIcon symbol={asset.symbol} />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>{asset.name}</ItemTitle>
                  <ItemDescription>
                    <Money amount={asset.price} currency="USD" />
                  </ItemDescription>
                </ItemContent>
                <ItemActions>
                  <ChangeBadge value={asset.change24h} />
                </ItemActions>
              </Item>
            ))}
          </ItemGroup>
        )}
      </CardContent>
    </Card>
  );
}
