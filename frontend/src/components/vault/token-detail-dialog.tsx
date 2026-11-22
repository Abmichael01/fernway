"use client";

import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight, Sparkles } from "lucide-react";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from "@/components/shared/responsive-modal";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/money";
import type { VaultHolding } from "@/types/vault";
import { CryptoIcon } from "./crypto-icon";

interface TokenDetailDialogProps {
  holding: VaultHolding | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSend: (symbol: string) => void;
  onReceive: () => void;
  onSwap: (symbol: string) => void;
  onStake: (symbol: string) => void;
}

export function TokenDetailDialog({
  holding,
  open,
  onOpenChange,
  onSend,
  onReceive,
  onSwap,
  onStake,
}: TokenDetailDialogProps) {
  if (!holding) return null;

  const isPositive = holding.change24h >= 0;
  const totalCoin = holding.amount + holding.stakedAmount;
  const totalValueCents = Math.round(holding.valueUsd * 100);

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange} desktop="dialog">
      <ResponsiveModalContent className="sm:max-w-md">
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>
            {holding.name} ({holding.symbol})
          </ResponsiveModalTitle>
          <ResponsiveModalDescription>
            {holding.network} Network
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>

        <div className="flex flex-col items-center gap-6 pt-3 text-center">
        {/* Token Icon & Price */}
        <div className="flex flex-col items-center gap-2">
          <CryptoIcon symbol={holding.symbol} size={56} />
          <div className="mt-1">
            <h3 className="font-heading text-3xl font-extrabold text-foreground">
              {formatMoney(totalValueCents, "USD")}
            </h3>
            <p className="font-mono text-sm font-semibold text-muted-foreground mt-0.5">
              {totalCoin.toLocaleString("en-US", { maximumFractionDigits: 6 })} {holding.symbol}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-foreground">
              ${holding.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
            </span>
            <span className={`font-semibold ${isPositive ? "text-emerald-500" : "text-rose-500"}`}>
              {isPositive ? "+" : ""}
              {holding.change24h.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Balance breakdown card */}
        <div className="grid w-full grid-cols-2 gap-3 rounded-2xl border border-border/80 bg-muted/40 p-4 text-left text-xs">
          <div>
            <span className="text-muted-foreground">Available (Liquid)</span>
            <p className="font-bold text-foreground text-sm font-mono mt-0.5">
              {holding.amount} {holding.symbol}
            </p>
            <span className="text-[10px] text-muted-foreground">
              ≈ {formatMoney(Math.round(holding.amount * holding.price * 100), "USD")}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Staked Yielding</span>
            <p className="font-bold text-emerald-500 text-sm font-mono mt-0.5">
              {holding.stakedAmount} {holding.symbol}
            </p>
            <span className="text-[10px] text-muted-foreground">
              ≈ {formatMoney(Math.round(holding.stakedAmount * holding.price * 100), "USD")}
            </span>
          </div>
        </div>

        {/* Quick Action Grid */}
        <div className="grid w-full grid-cols-4 gap-2 pt-1">
          <Button
            variant="outline"
            className="flex h-16 flex-col items-center justify-center gap-1 rounded-2xl"
            onClick={() => {
              onOpenChange(false);
              onSend(holding.symbol);
            }}
          >
            <ArrowUpRight className="size-4 text-[var(--primary)]" />
            <span className="text-[11px] font-semibold">Send</span>
          </Button>

          <Button
            variant="outline"
            className="flex h-16 flex-col items-center justify-center gap-1 rounded-2xl"
            onClick={() => {
              onOpenChange(false);
              onReceive();
            }}
          >
            <ArrowDownLeft className="size-4 text-[var(--primary)]" />
            <span className="text-[11px] font-semibold">Receive</span>
          </Button>

          <Button
            variant="outline"
            className="flex h-16 flex-col items-center justify-center gap-1 rounded-2xl"
            onClick={() => {
              onOpenChange(false);
              onSwap(holding.symbol);
            }}
          >
            <ArrowLeftRight className="size-4 text-[var(--primary)]" />
            <span className="text-[11px] font-semibold">Swap</span>
          </Button>

          <Button
            variant="outline"
            className="flex h-16 flex-col items-center justify-center gap-1 rounded-2xl"
            onClick={() => {
              onOpenChange(false);
              onStake(holding.symbol);
            }}
          >
            <Sparkles className="size-4 text-emerald-500" />
            <span className="text-[11px] font-semibold">Stake</span>
          </Button>
        </div>
      </div>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
