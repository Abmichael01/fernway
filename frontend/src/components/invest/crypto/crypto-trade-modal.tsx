"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from "@/components/shared/responsive-modal";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { usePlaceInvestTrade } from "@/hooks/invest/usePlaceInvestTrade";
import { formatMoney } from "@/lib/money";
import type { CryptoSymbol, HoldingLine, InvestMarketPrice, TradeSide } from "@/types/invest";
import { Bep20CheckoutPanel } from "../shared/bep20-checkout-panel";
import { TradeForm } from "../shared/trade-form";

interface Props {
  trade: { symbol: CryptoSymbol; side: TradeSide } | null;
  coins: InvestMarketPrice[];
  cash: number;
  direct: HoldingLine[];
  paused: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CryptoTradeModal({ trade, coins, cash, direct, paused, onOpenChange }: Props) {
  return (
    <ResponsiveModal open={trade !== null} onOpenChange={onOpenChange} desktop="sheet">
      <ResponsiveModalContent>
        {trade && (
          <Body key={trade.symbol} initial={trade} coins={coins} cash={cash} direct={direct} paused={paused} onDone={() => onOpenChange(false)} />
        )}
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}

function Body({ initial, coins, cash, direct, paused, onDone }: { initial: { symbol: CryptoSymbol; side: TradeSide }; coins: InvestMarketPrice[]; cash: number; direct: HoldingLine[]; paused: boolean; onDone: () => void }) {
  const [side, setSide] = useState<TradeSide>(initial.side);
  const [payWith, setPayWith] = useState<"bep20" | "cash">("bep20");
  const place = usePlaceInvestTrade();
  const coin = coins.find((item) => item.symbol === initial.symbol);
  const name = coin?.name ?? initial.symbol;
  const holdingValue = direct.find((line) => line.symbol === initial.symbol)?.value ?? 0;
  const buying = side === "buy";

  return (
    <>
      <ResponsiveModalHeader className="border-b px-6 pt-6 pb-5">
        <ResponsiveModalTitle className="font-heading text-xl">
          {buying ? "Buy" : "Sell"} {name}
        </ResponsiveModalTitle>
        <ResponsiveModalDescription>
          {buying
            ? payWith === "bep20"
              ? "Pay directly in USD (USDC) on BNB Smart Chain (BEP-20)."
              : "Paid from your investing cash."
            : "Proceeds go to your investing cash."}
        </ResponsiveModalDescription>
        <ToggleGroup
          type="single"
          variant="outline"
          value={side}
          onValueChange={(value) => value && setSide(value as TradeSide)}
          className="mt-3 w-full"
          aria-label="Buy or sell"
        >
          <ToggleGroupItem value="buy" className="flex-1">
            Buy
          </ToggleGroupItem>
          <ToggleGroupItem value="sell" className="flex-1" disabled={holdingValue === 0}>
            Sell
          </ToggleGroupItem>
        </ToggleGroup>
        {buying && (
          <ToggleGroup
            type="single"
            variant="outline"
            value={payWith}
            onValueChange={(value) => value && setPayWith(value as "bep20" | "cash")}
            className="mt-2 w-full"
            aria-label="Payment method"
          >
            <ToggleGroupItem value="bep20" className="flex-1 text-xs">
              Pay via BEP-20
            </ToggleGroupItem>
            <ToggleGroupItem value="cash" className="flex-1 text-xs">
              Investing Cash
            </ToggleGroupItem>
          </ToggleGroup>
        )}
      </ResponsiveModalHeader>
      {buying && payWith === "bep20" ? (
        <Bep20CheckoutPanel
          description={`Buy ${name} (${initial.symbol})`}
          submitLabel={`Buy ${initial.symbol}`}
          onDone={onDone}
        />
      ) : (
        <TradeForm
          key={side}
          side={side}
          target={initial.symbol}
          available={buying ? cash : holdingValue}
          availableLabel={buying ? "investing cash available" : `of ${initial.symbol} available to sell`}
          submitLabel={buying ? `Buy ${initial.symbol}` : `Sell ${initial.symbol}`}
          paused={paused}
          note="Prices move quickly. Crypto isn't FDIC- or SIPC-insured and can lose some or all of its value."
          onSubmit={async (cents) => {
            await place.mutateAsync({ side, symbol: initial.symbol, amount: cents });
            toast.success(`${buying ? "Bought" : "Sold"} ${formatMoney(cents, "USD")} of ${name}`);
            onDone();
          }}
        />
      )}
    </>
  );
}
