"use client";

import { useState } from "react";
import { Gift, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { formatMoney } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { VaultHolding } from "@/types/vault";
import { STAKING_OPTIONS } from "@/config/vault";
import { CryptoIcon } from "./crypto-icon";

interface EarnTabProps {
  holdings: VaultHolding[];
  onOpenStake: (symbol: string) => void;
}

export function EarnTab({ holdings, onOpenStake }: EarnTabProps) {
  const [claimed, setClaimed] = useState(false);

  const totalStakedUsd = holdings.reduce((sum, h) => sum + h.stakedAmount * h.price, 0);
  const estimatedAnnualRewardUsd = holdings.reduce((sum, h) => {
    const opt = STAKING_OPTIONS.find((o) => o.symbol === h.symbol);
    const apy = opt?.apyPercent ?? 5.0;
    return sum + (h.stakedAmount * h.price * apy) / 100;
  }, 0);

  const pendingRewardUsd = (estimatedAnnualRewardUsd / 365) * 14.5; // Accrued rewards

  const handleClaim = () => {
    setClaimed(true);
    toast.success(`Claimed $${pendingRewardUsd.toFixed(2)} in staking rewards!`);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Earn Header Stats Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card p-6 dark:bg-[#0E121A]">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div className="flex flex-col gap-1">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-primary">
              <Sparkles className="size-4" />
              <span>Multi-Chain Staking & Yield</span>
            </span>
            <h3 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {formatMoney(Math.round(totalStakedUsd * 100), "USD")}
            </h3>
            <p className="text-xs text-muted-foreground">
              Total active assets earning protocol rewards
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-col rounded-2xl border border-border/60 bg-muted/30 px-4 py-2.5">
              <span className="text-[11px] text-muted-foreground">Est. Annual Yield</span>
              <span className="font-heading text-base font-bold text-emerald-500">
                +${estimatedAnnualRewardUsd.toFixed(2)} / yr
              </span>
            </div>

            <div className="flex flex-col rounded-2xl border border-border/60 bg-muted/30 px-4 py-2.5">
              <span className="text-[11px] text-muted-foreground">Accrued Rewards</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-heading text-base font-bold text-foreground">
                  {claimed ? "$0.00" : `$${pendingRewardUsd.toFixed(2)}`}
                </span>
                <Button
                  size="sm"
                  onClick={handleClaim}
                  disabled={claimed || totalStakedUsd <= 0}
                  className="h-7 rounded-xl bg-emerald-600 px-2.5 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  <Gift className="size-3 mr-1" />
                  Claim
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Staking Pools / Assets */}
      <div className="flex flex-col gap-3">
        <h4 className="font-heading text-base font-bold text-foreground">Available Staking Pools</h4>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {STAKING_OPTIONS.map((opt) => {
            const holding = holdings.find((h) => h.symbol === opt.symbol);
            const isStaked = (holding?.stakedAmount ?? 0) > 0;

            return (
              <div
                key={opt.symbol}
                className="flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-4 dark:bg-[#0E121A]"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CryptoIcon symbol={opt.symbol} size={38} />
                      <div className="flex flex-col">
                        <span className="font-heading font-bold text-foreground">{opt.name}</span>
                        <span className="text-xs text-muted-foreground">{opt.network}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-500 font-bold">
                      {opt.apyPercent}% APY
                    </Badge>
                  </div>

                  <div className="mt-3 flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 p-2.5 text-xs">
                    <span className="text-muted-foreground">Lockup Period:</span>
                    <span className="font-semibold text-foreground">
                      {opt.lockupDays === 0 ? "Flexible (No Lockup)" : `${opt.lockupDays} Days`}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground px-1">
                    <span>Validator:</span>
                    <span className="font-mono text-foreground">{opt.validator}</span>
                  </div>

                  {isStaked && (
                    <div className="mt-3 flex items-center justify-between rounded-xl bg-emerald-500/10 p-2.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      <span>Currently Staked:</span>
                      <span className="font-mono font-bold">
                        {holding?.stakedAmount} {opt.symbol} (≈ $
                        {((holding?.stakedAmount ?? 0) * (holding?.price ?? 1)).toFixed(2)})
                      </span>
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => onOpenStake(opt.symbol)}
                  className="mt-3 h-10 w-full rounded-xl font-bold"
                >
                  {isStaked ? "Stake More" : `Stake ${opt.symbol}`}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
