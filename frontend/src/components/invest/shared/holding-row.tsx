import { CoinIcon } from "@/components/shared/coin-icon";
import { Money } from "@/components/shared/money";
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item";
import { formatQuantity } from "@/lib/crypto";
import type { HoldingLine } from "@/types/invest";
import { GainLoss } from "./gain-loss";

export function HoldingRow({ holding }: { holding: HoldingLine }) {
  return (
    <Item size="sm" className="px-0">
      <ItemMedia>
        <CoinIcon symbol={holding.symbol} />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{holding.name}</ItemTitle>
        <ItemDescription>
          {formatQuantity(holding.quantity, holding.symbol)} at <Money amount={holding.price} currency="USD" />
        </ItemDescription>
      </ItemContent>
      <ItemActions className="flex-col items-end gap-0.5">
        <Money amount={holding.value} currency="USD" className="font-medium" />
        <GainLoss value={holding.value} cost={holding.cost} className="text-xs" />
      </ItemActions>
    </Item>
  );
}
