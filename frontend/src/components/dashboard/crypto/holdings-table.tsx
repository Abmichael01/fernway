"use client";

import { ChangeBadge } from "@/components/shared/change-badge";
import { CoinIcon } from "@/components/shared/coin-icon";
import { Money } from "@/components/shared/money";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatQuantity, holdingValue } from "@/lib/crypto";
import { cn } from "@/lib/utils";
import type { CryptoAsset, CryptoSymbol, TradeSide } from "@/types/banking";

interface HoldingsTableProps {
  assets: CryptoAsset[];
  selected: CryptoSymbol;
  onSelect: (symbol: CryptoSymbol) => void;
  onTrade: (side: TradeSide, symbol: CryptoSymbol) => void;
}

export function HoldingsTable({ assets, selected, onSelect, onTrade }: HoldingsTableProps) {
  return (
    <Card className="gap-2">
      <CardHeader>
        <CardTitle className="font-heading text-base font-semibold">Your assets</CardTitle>
      </CardHeader>
      <CardContent className="px-2 sm:px-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asset</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="hidden text-right sm:table-cell">24h</TableHead>
              <TableHead className="text-right">Balance</TableHead>
              <TableHead className="hidden text-right md:table-cell">Return</TableHead>
              <TableHead className="hidden w-0 lg:table-cell">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.map((asset) => {
              const value = holdingValue(asset);
              const cost = Math.round(asset.holding * asset.averageCost);
              const active = asset.symbol === selected;
              return (
                <TableRow
                  key={asset.symbol}
                  data-state={active ? "selected" : undefined}
                  onClick={() => onSelect(asset.symbol)}
                  className="cursor-pointer"
                >
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => onSelect(asset.symbol)}
                      aria-pressed={active}
                      className="flex items-center gap-3 rounded-md text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <CoinIcon symbol={asset.symbol} className="size-9" />
                      <span>
                        <span className="block font-medium">{asset.name}</span>
                        <span className="block text-xs text-muted-foreground">{asset.symbol}</span>
                      </span>
                    </button>
                  </TableCell>
                  <TableCell className="text-right">
                    <Money amount={asset.price} currency="USD" />
                  </TableCell>
                  <TableCell className="hidden text-right sm:table-cell">
                    <ChangeBadge value={asset.change24h} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Money amount={value} currency="USD" sensitive className="block font-medium" />
                    <span className="block text-xs text-muted-foreground tabular-nums">
                      {formatQuantity(asset.holding, asset.symbol)}
                    </span>
                  </TableCell>
                  <TableCell className={cn("hidden text-right md:table-cell", value - cost >= 0 ? "text-credit" : "text-debit")}>
                    <Money amount={value - cost} currency="USD" signed sensitive />
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(event) => {
                          event.stopPropagation();
                          onTrade("buy", asset.symbol);
                        }}
                      >
                        Buy
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={asset.holding <= 0}
                        onClick={(event) => {
                          event.stopPropagation();
                          onTrade("sell", asset.symbol);
                        }}
                      >
                        Sell
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
