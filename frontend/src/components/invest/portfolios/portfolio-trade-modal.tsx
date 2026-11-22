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
import { useInvestInPortfolio } from "@/hooks/invest/useInvestInPortfolio";
import { useWithdrawFromPortfolio } from "@/hooks/invest/useWithdrawFromPortfolio";
import { formatMoney } from "@/lib/money";
import type { Portfolio, TradeSide } from "@/types/invest";
import { PORTFOLIO_NOTE } from "@/config/invest";
import { Bep20CheckoutPanel } from "../shared/bep20-checkout-panel";
import { TradeForm } from "../shared/trade-form";

interface Props {
  portfolio: Portfolio;
  side: TradeSide | null;
  cash: number;
  positionValue: number;
  paused: boolean;
  onClose: () => void;
}

export function PortfolioTradeModal({ portfolio, side, cash, positionValue, paused, onClose }: Props) {
  const [payWith, setPayWith] = useState<"bep20" | "cash">("bep20");
  const invest = useInvestInPortfolio();
  const withdraw = useWithdrawFromPortfolio();
  const buying = side === "buy";

  return (
    <ResponsiveModal open={side !== null} onOpenChange={(open) => !open && onClose()} desktop="sheet">
      <ResponsiveModalContent>
        <ResponsiveModalHeader className="border-b px-6 pt-6 pb-5">
          <ResponsiveModalTitle className="font-heading text-xl">
            {buying ? "Invest in" : "Withdraw from"} {portfolio.name}
          </ResponsiveModalTitle>
          <ResponsiveModalDescription>
            {buying
              ? payWith === "bep20"
                ? "Pay directly in USD (USDC) on BNB Smart Chain (BEP-20)."
                : "Paid from your investing cash."
              : "Proceeds go to your investing cash."}
          </ResponsiveModalDescription>
          {buying && (
            <ToggleGroup
              type="single"
              variant="outline"
              value={payWith}
              onValueChange={(value) => value && setPayWith(value as "bep20" | "cash")}
              className="mt-3 w-full"
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
        {side && buying && payWith === "bep20" ? (
          <Bep20CheckoutPanel
            description={`Invest in ${portfolio.name}`}
            submitLabel="Invest"
            onDone={onClose}
          />
        ) : side ? (
          <TradeForm
            key={side}
            side={side}
            target={portfolio.id}
            available={buying ? cash : positionValue}
            availableLabel={buying ? "investing cash available" : "in this portfolio"}
            submitLabel={buying ? "Invest" : "Withdraw"}
            paused={paused}
            note={PORTFOLIO_NOTE}
            onSubmit={async (cents) => {
              if (buying) await invest.mutateAsync({ id: portfolio.id, amount: cents });
              else await withdraw.mutateAsync({ id: portfolio.id, request: { amount: cents } });
              toast.success(`${buying ? "Invested" : "Withdrew"} ${formatMoney(cents, "USD")} ${buying ? "in" : "from"} ${portfolio.name}`);
              onClose();
            }}
            onSubmitAll={
              buying
                ? undefined
                : async () => {
                    await withdraw.mutateAsync({ id: portfolio.id, request: { all: true } });
                    toast.success(`Withdrew everything from ${portfolio.name}`);
                    onClose();
                  }
            }
          />
        ) : null}
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
