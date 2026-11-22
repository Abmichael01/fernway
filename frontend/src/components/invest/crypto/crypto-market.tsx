"use client";

import { useState } from "react";
import { Bitcoin } from "lucide-react";
import { ChangeBadge } from "@/components/shared/change-badge";
import { CoinIcon } from "@/components/shared/coin-icon";
import { Money } from "@/components/shared/money";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState, QueryError } from "@/components/shared/query-states";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemSeparator, ItemTitle } from "@/components/ui/item";
import { Skeleton } from "@/components/ui/skeleton";
import { useInvestOverview } from "@/hooks/invest/useInvestOverview";
import { useInvestPrices } from "@/hooks/invest/useInvestPrices";
import { formatQuantity } from "@/lib/crypto";
import type { CryptoSymbol, TradeSide } from "@/types/invest";
import { PricesWarning } from "../shared/prices-warning";
import { CryptoTradeModal } from "./crypto-trade-modal";

export function CryptoMarket() {
  const prices = useInvestPrices();
  const overview = useInvestOverview();
  const [trade, setTrade] = useState<{ symbol: CryptoSymbol; side: TradeSide } | null>(null);

  const paused = overview.data ? !overview.data.pricesLive : false;
  const held = (symbol: CryptoSymbol) => overview.data?.direct.find((line) => line.symbol === symbol);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Crypto" description="Buy and sell coins directly with your investing cash." />
      {paused && <PricesWarning />}
      {prices.isError ? (
        <QueryError message="We couldn't load prices." onRetry={() => void prices.refetch()} />
      ) : prices.isPending ? (
        <div className="flex flex-col gap-3" aria-busy="true">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : prices.data.length === 0 ? (
        <EmptyState icon={<Bitcoin />} title="No coins to show" description="Prices aren't available right now." className="rounded-lg border border-dashed" />
      ) : (
        <Card>
          <CardContent>
            <ItemGroup>
              {prices.data.map((coin, index) => {
                const holding = held(coin.symbol);
                return (
                  <div key={coin.symbol}>
                    {index > 0 && <ItemSeparator />}
                    <Item className="px-0 py-4">
                      <ItemMedia>
                        <CoinIcon symbol={coin.symbol} />
                      </ItemMedia>
                      <ItemContent>
                        <ItemTitle>{coin.name}</ItemTitle>
                        <ItemDescription>
                          {holding ? (
                            <>
                              You hold {formatQuantity(holding.quantity, coin.symbol)} (<Money amount={holding.value} currency="USD" />)
                            </>
                          ) : (
                            coin.symbol
                          )}
                        </ItemDescription>
                      </ItemContent>
                      <ItemActions className="ml-auto flex-col items-end gap-1 sm:flex-row sm:gap-4">
                        <div className="flex flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-3">
                          <Money amount={coin.price} currency="USD" className="font-medium" />
                          <ChangeBadge value={coin.change24h} />
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" disabled={paused} onClick={() => setTrade({ symbol: coin.symbol, side: "buy" })}>
                            Buy
                          </Button>
                          {holding && holding.quantity > 0 && (
                            <Button size="sm" variant="outline" disabled={paused} onClick={() => setTrade({ symbol: coin.symbol, side: "sell" })}>
                              Sell
                            </Button>
                          )}
                        </div>
                      </ItemActions>
                    </Item>
                  </div>
                );
              })}
            </ItemGroup>
          </CardContent>
        </Card>
      )}
      <CryptoTradeModal
        trade={trade}
        coins={prices.data ?? []}
        cash={overview.data?.cash ?? 0}
        direct={overview.data?.direct ?? []}
        paused={paused || !overview.data}
        onOpenChange={(open) => !open && setTrade(null)}
      />
    </div>
  );
}
