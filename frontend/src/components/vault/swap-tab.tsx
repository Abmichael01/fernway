"use client";

import { useState } from "react";
import { ArrowDownUp, Route, Settings2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { VaultHolding } from "@/types/vault";
import { SUPPORTED_TOKENS } from "@/config/vault";
import { useSwapCrypto } from "@/hooks/vault/useVault";
import { CryptoIcon } from "./crypto-icon";

interface SwapTabProps {
  holdings: VaultHolding[];
}

export function SwapTab({ holdings }: SwapTabProps) {
  const [fromSymbol, setFromSymbol] = useState("ETH");
  const [toSymbol, setToSymbol] = useState("USDC");
  const [fromAmount, setFromAmount] = useState<string>("0.5");
  const [slippage, setSlippage] = useState("0.5");
  const [showSettings, setShowSettings] = useState(false);

  const swapMutation = useSwapCrypto();

  const fromHolding = holdings.find((h) => h.symbol === fromSymbol);
  const toHolding = holdings.find((h) => h.symbol === toSymbol);

  const fromPrice = SUPPORTED_TOKENS[fromSymbol]?.price ?? 1;
  const toPrice = SUPPORTED_TOKENS[toSymbol]?.price ?? 1;

  const parsedFrom = parseFloat(fromAmount) || 0;
  const calculatedTo = (parsedFrom * fromPrice) / toPrice;

  const availableBalance = fromHolding?.amount ?? 0;

  const handleFlip = () => {
    setFromSymbol(toSymbol);
    setToSymbol(fromSymbol);
    setFromAmount(calculatedTo > 0 ? calculatedTo.toFixed(4) : "0");
  };

  const handleMax = () => {
    setFromAmount(availableBalance.toString());
  };

  const handleSwap = () => {
    if (parsedFrom <= 0) {
      toast.error("Please enter an amount to swap");
      return;
    }
    if (parsedFrom > availableBalance) {
      toast.error(`Insufficient ${fromSymbol} balance. Available: ${availableBalance}`);
      return;
    }

    swapMutation.mutate(
      {
        fromSymbol,
        toSymbol,
        fromAmount: parsedFrom,
        toAmount: calculatedTo,
        network: SUPPORTED_TOKENS[fromSymbol]?.network ?? "Ethereum",
      },
      {
        onSuccess: () => {
          toast.success(
            `Swapped ${parsedFrom} ${fromSymbol} for ${calculatedTo.toFixed(4)} ${toSymbol}!`,
          );
          setFromAmount("");
        },
        onError: (err) => {
          toast.error(err.message || "Failed to execute swap.");
        },
      },
    );
  };

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-4">
      <div className="rounded-2xl border border-border/80 bg-card p-5 dark:bg-[#0E121A] sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4">
          <div className="flex items-center gap-2">
            <span className="font-heading text-lg font-bold text-foreground">Instant Swap</span>
            <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-semibold text-primary">
              Zero Fee Tier
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className="grid size-8 place-items-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"
            title="Swap settings"
          >
            <Settings2 className="size-4" />
          </button>
        </div>

        {/* Slippage Settings */}
        {showSettings && (
          <div className="mb-4 flex flex-col gap-2 rounded-2xl border border-border/80 bg-muted/40 p-3 text-xs">
            <span className="font-semibold text-foreground">Max Slippage Tolerance</span>
            <div className="flex gap-2">
              {["0.1", "0.5", "1.0"].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setSlippage(val)}
                  className={`rounded-xl px-3 py-1 font-mono text-xs font-semibold ${
                    slippage === val
                      ? "bg-primary text-white"
                      : "border border-border/60 bg-card text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {val}%
                </button>
              ))}
            </div>
          </div>
        )}

        {/* You Pay Box */}
        <div className="flex flex-col gap-2 rounded-2xl border border-border/60 bg-muted/40 p-4 transition-colors focus-within:border-primary">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>You Pay</span>
            <div className="flex items-center gap-1.5">
              <span>Balance: {availableBalance.toFixed(4)} {fromSymbol}</span>
              <button
                type="button"
                onClick={handleMax}
                className="font-bold text-primary hover:underline"
              >
                MAX
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <Input
              type="number"
              placeholder="0.0"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              className="border-none bg-transparent p-0 text-2xl font-bold font-mono focus-visible:ring-0 sm:text-3xl"
            />
            <Select value={fromSymbol} onValueChange={setFromSymbol}>
              <SelectTrigger className="w-36 rounded-xl bg-card font-semibold gap-2">
                <CryptoIcon symbol={fromSymbol} size={20} />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(SUPPORTED_TOKENS).map((sym) => (
                  <SelectItem key={sym} value={sym} disabled={sym === toSymbol}>
                    <div className="flex items-center gap-2">
                      <CryptoIcon symbol={sym} size={18} />
                      <span>{sym}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <span className="text-xs text-muted-foreground font-mono">
            ≈ ${(parsedFrom * fromPrice).toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </span>
        </div>

        {/* Flip button */}
        <div className="relative my-2 flex justify-center">
          <button
            type="button"
            onClick={handleFlip}
            className="grid size-9 place-items-center rounded-xl border border-border/80 bg-card text-foreground transition-transform hover:scale-110 active:scale-95"
            title="Invert swap pair"
          >
            <ArrowDownUp className="size-4" />
          </button>
        </div>

        {/* You Receive Box */}
        <div className="flex flex-col gap-2 rounded-2xl border border-border/60 bg-muted/40 p-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>You Receive (Estimated)</span>
            <span>Balance: {(toHolding?.amount ?? 0).toFixed(4)} {toSymbol}</span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="text-2xl font-bold font-mono text-foreground sm:text-3xl">
              {calculatedTo > 0 ? calculatedTo.toFixed(4) : "0.0"}
            </div>
            <Select value={toSymbol} onValueChange={setToSymbol}>
              <SelectTrigger className="w-36 rounded-xl bg-card font-semibold gap-2">
                <CryptoIcon symbol={toSymbol} size={20} />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(SUPPORTED_TOKENS).map((sym) => (
                  <SelectItem key={sym} value={sym} disabled={sym === fromSymbol}>
                    <div className="flex items-center gap-2">
                      <CryptoIcon symbol={sym} size={18} />
                      <span>{sym}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <span className="text-xs text-muted-foreground font-mono">
            ≈ ${(calculatedTo * toPrice).toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </span>
        </div>

        {/* Routing details */}
        <div className="mt-4 flex flex-col gap-2 rounded-2xl border border-border/60 bg-muted/20 p-3.5 text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Route className="size-3.5" />
              <span>Route Provider</span>
            </span>
            <span className="font-semibold text-foreground">Uniswap v3 + Raydium Aggregator</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Rate</span>
            <span className="font-mono text-foreground">
              1 {fromSymbol} = {(fromPrice / toPrice).toFixed(4)} {toSymbol}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Max Slippage</span>
            <span className="font-mono text-foreground">{slippage}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Estimated Network Gas</span>
            <span className="font-mono text-emerald-500 font-semibold">$0.00 (Gas Subsidized)</span>
          </div>
        </div>

        {/* Swap Button */}
        <Button
          onClick={handleSwap}
          disabled={swapMutation.isPending || parsedFrom <= 0}
          className="mt-5 h-12 w-full rounded-xl text-sm font-bold gap-2"
        >
          {swapMutation.isPending ? (
            <span>Executing On-Chain Swap...</span>
          ) : (
            <>
              <Sparkles className="size-4" />
              <span>Swap {fromSymbol} to {toSymbol}</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
