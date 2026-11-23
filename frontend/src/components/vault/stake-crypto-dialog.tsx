"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from "@/components/shared/responsive-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { VaultHolding } from "@/types/vault";
import { STAKING_OPTIONS, SUPPORTED_TOKENS } from "@/config/vault";
import { useStakeCrypto } from "@/hooks/vault/useVault";

interface StakeCryptoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  holdings: VaultHolding[];
  initialSymbol?: string;
}

export function StakeCryptoDialog({
  open,
  onOpenChange,
  holdings,
  initialSymbol = "SOL",
}: StakeCryptoDialogProps) {
  const [symbol, setSymbol] = useState(initialSymbol);
  const [amount, setAmount] = useState("");

  const stakeMutation = useStakeCrypto();

  const stakingOpt = STAKING_OPTIONS.find((o) => o.symbol === symbol) ?? STAKING_OPTIONS[0];
  const holding = holdings.find((h) => h.symbol === symbol);
  const available = holding?.amount ?? 0;
  const parsedAmount = parseFloat(amount) || 0;

  const tokenMeta = SUPPORTED_TOKENS[symbol];
  const price = tokenMeta?.price ?? 1;

  const annualYield = (parsedAmount * stakingOpt.apyPercent) / 100;
  const monthlyYield = annualYield / 12;

  const handleMax = () => {
    setAmount(available.toString());
  };

  const handleStake = () => {
    if (parsedAmount <= 0) {
      toast.error("Please enter an amount to stake");
      return;
    }
    if (parsedAmount > available) {
      toast.error(`Insufficient ${symbol} balance. Available: ${available}`);
      return;
    }

    stakeMutation.mutate(
      {
        symbol,
        amount: parsedAmount,
        validator: stakingOpt.validator,
        network: stakingOpt.network,
      },
      {
        onSuccess: () => {
          toast.success(`Staked ${parsedAmount} ${symbol} with ${stakingOpt.validator}!`);
          onOpenChange(false);
          setAmount("");
        },
        onError: (err) => {
          toast.error(err.message || "Staking failed");
        },
      },
    );
  };

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange} desktop="dialog">
      <ResponsiveModalContent className="sm:max-w-md">
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>Stake {symbol}</ResponsiveModalTitle>
          <ResponsiveModalDescription>
            Lock proof-of-stake assets with verified validators to earn protocol yield.
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>

        <div className="flex flex-col gap-5 pt-2">
        {/* Pool selection */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Staking Asset</Label>
          <Select value={symbol} onValueChange={setSymbol}>
            <SelectTrigger className="h-11 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STAKING_OPTIONS.map((opt) => (
                <SelectItem key={opt.symbol} value={opt.symbol}>
                  <div className="flex items-center justify-between w-full gap-4">
                    <span>{opt.name}</span>
                    <span className="font-bold text-emerald-500 text-xs">
                      {opt.apyPercent}% APY
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Amount Input */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <Label className="text-xs">Stake Amount</Label>
            <div className="flex items-center gap-1.5">
              <span>Liquid: {available} {symbol}</span>
              <button
                type="button"
                onClick={handleMax}
                className="font-bold text-[var(--primary)] hover:underline"
              >
                MAX
              </button>
            </div>
          </div>
          <div className="relative">
            <Input
              type="number"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-12 rounded-xl text-lg font-bold font-mono pr-16"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-bold text-xs text-muted-foreground">
              {symbol}
            </span>
          </div>
        </div>

        {/* Projected Rewards Calculator */}
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="size-3.5" />
              <span>Projected Rewards ({stakingOpt.apyPercent}% APY)</span>
            </span>
            <Badge className="bg-emerald-600 text-white border-none text-[10px]">Compounded</Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-emerald-500/20">
            <div>
              <span className="text-muted-foreground">Monthly Estimate</span>
              <p className="font-bold font-mono text-foreground text-sm">
                +{monthlyYield.toFixed(4)} {symbol}
              </p>
              <span className="text-[10px] text-muted-foreground">
                ≈ +${(monthlyYield * price).toFixed(2)} USD
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Annual Estimate</span>
              <p className="font-bold font-mono text-emerald-500 text-sm">
                +{annualYield.toFixed(4)} {symbol}
              </p>
              <span className="text-[10px] text-muted-foreground">
                ≈ +${(annualYield * price).toFixed(2)} USD
              </span>
            </div>
          </div>
        </div>

        {/* Staking Specs */}
        <div className="flex flex-col gap-2 rounded-xl bg-muted/40 p-3 text-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Validator</span>
            <span className="font-semibold text-foreground">{stakingOpt.validator}</span>
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Lockup / Unbonding</span>
            <span className="font-semibold text-foreground">
              {stakingOpt.lockupDays === 0 ? "Flexible (Withdraw Anytime)" : `${stakingOpt.lockupDays} Days`}
            </span>
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Protocol Gas Fee</span>
            <span className="font-semibold text-emerald-500">Free (Covered by Lindenway)</span>
          </div>
        </div>

        <Button
          onClick={handleStake}
          disabled={stakeMutation.isPending || parsedAmount <= 0 || parsedAmount > available}
          className="bg-emerald-600 h-11 w-full rounded-xl font-bold text-white hover:bg-emerald-700"
        >
          {stakeMutation.isPending ? "Delegating On-Chain..." : `Confirm Stake of ${symbol}`}
        </Button>
      </div>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
