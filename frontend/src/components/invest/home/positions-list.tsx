import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Money } from "@/components/shared/money";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemTitle } from "@/components/ui/item";
import { RISK_LABELS } from "@/lib/invest";
import type { InvestOverview } from "@/types/invest";
import { AllocationBar } from "../shared/allocation-bar";
import { GainLoss } from "../shared/gain-loss";
import { HoldingRow } from "../shared/holding-row";

export function PositionsList({ overview }: { overview: InvestOverview }) {
  return (
    <div className="grid items-start gap-6 lg:grid-cols-2">
      {overview.portfolios.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-base font-semibold">Your portfolios</CardTitle>
          </CardHeader>
          <CardContent>
            <ItemGroup>
              {overview.portfolios.map(({ portfolio, value, cost }) => (
                <Item key={portfolio.id} asChild size="sm" className="px-0">
                  <Link href={`/invest/portfolios/${portfolio.id}`}>
                    <ItemContent className="gap-2">
                      <ItemTitle>{portfolio.name}</ItemTitle>
                      <ItemDescription>{RISK_LABELS[portfolio.risk]}</ItemDescription>
                      <AllocationBar allocations={portfolio.allocations} className="h-1.5" />
                    </ItemContent>
                    <ItemActions className="flex-col items-end gap-0.5">
                      <Money amount={value} currency="USD" className="font-medium" />
                      <GainLoss value={value} cost={cost} className="text-xs" />
                    </ItemActions>
                    <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />
                  </Link>
                </Item>
              ))}
            </ItemGroup>
          </CardContent>
        </Card>
      )}
      {overview.direct.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-base font-semibold">Coins you bought directly</CardTitle>
          </CardHeader>
          <CardContent>
            <ItemGroup>
              {overview.direct.map((holding) => (
                <HoldingRow key={holding.symbol} holding={holding} />
              ))}
            </ItemGroup>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
