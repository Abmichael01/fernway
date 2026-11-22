"use client";

import { useState } from "react";
import { CreditCard, ShieldCheck, Smartphone, Zap } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SUPPORTED_TOKENS } from "@/config/vault";

interface BuyCryptoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccessBuy: (symbol: string, amount: number) => void;
}

export function BuyCryptoDialog({ open, onOpenChange, onSuccessBuy }: BuyCryptoDialogProps) {
  const [fiatAmount, setFiatAmount] = useState<string>("250");
  const [symbol, setSymbol] = useState<string>("ETH");
  const [paymentMethod, setPaymentMethod] = useState<"apple_pay" | "card" | "bank">("apple_pay");
  const [isProcessing, setIsProcessing] = useState(false);

  const tokenMeta = SUPPORTED_TOKENS[symbol];
  const price = tokenMeta?.price ?? 1;
  const parsedFiat = parseFloat(fiatAmount) || 0;
  const estimatedCoins = parsedFiat > 0 ? (parsedFiat * 0.985) / price : 0; // 1.5% fee

  const handleBuy = () => {
    if (parsedFiat < 10) {
      toast.error("Minimum purchase is $10 USD");
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onSuccessBuy(symbol, estimatedCoins);
      toast.success(
        `Successfully purchased ${estimatedCoins.toFixed(4)} ${symbol} via ${
          paymentMethod === "apple_pay" ? "Apple Pay" : "Debit Card"
        }!`,
      );
      onOpenChange(false);
    }, 1200);
  };

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange} desktop="dialog">
      <ResponsiveModalContent className="sm:max-w-md">
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>Buy Crypto</ResponsiveModalTitle>
          <ResponsiveModalDescription>
            Purchase crypto directly with fiat using Apple Pay, cards or bank transfer.
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>

        <div className="flex flex-col gap-5 pt-2">
        {/* Quick Amount presets */}
        <div className="flex items-center gap-2">
          {["50", "100", "250", "500", "1000"].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setFiatAmount(preset)}
              className={`flex-1 rounded-xl py-1.5 text-xs font-semibold transition-all ${
                fiatAmount === preset
                  ? "bg-primary text-white"
                  : "border border-border/80 bg-card text-muted-foreground hover:bg-muted"
              }`}
            >
              ${preset}
            </button>
          ))}
        </div>

        {/* Input box */}
        <div className="flex flex-col gap-2 rounded-2xl border border-border/60 bg-muted/40 p-4">
          <span className="text-xs text-muted-foreground">You Spend (USD)</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-muted-foreground">$</span>
            <Input
              type="number"
              value={fiatAmount}
              onChange={(e) => setFiatAmount(e.target.value)}
              className="border-none bg-transparent p-0 text-3xl font-bold font-mono focus-visible:ring-0"
            />
          </div>
        </div>

        {/* Asset to receive */}
        <div className="flex flex-col gap-2 rounded-2xl border border-border/60 bg-muted/40 p-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>You Receive (Estimated)</span>
            <span>Rate: 1 {symbol} ≈ ${price.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="text-2xl font-bold font-mono text-foreground">
              {estimatedCoins.toFixed(4)}
            </div>
            <Select value={symbol} onValueChange={setSymbol}>
              <SelectTrigger className="w-32 rounded-xl bg-card font-semibold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(SUPPORTED_TOKENS).map((sym) => (
                  <SelectItem key={sym} value={sym}>
                    {sym}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-muted-foreground">Payment Method</span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setPaymentMethod("apple_pay")}
              className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-xs font-semibold transition-all ${
                paymentMethod === "apple_pay"
                  ? "border-[var(--primary)] bg-[var(--primary)]/10 text-foreground"
                  : "border-border/80 bg-card text-muted-foreground hover:bg-muted"
              }`}
            >
              <Smartphone className="size-4" />
              <span>Apple Pay</span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("card")}
              className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-xs font-semibold transition-all ${
                paymentMethod === "card"
                  ? "border-[var(--primary)] bg-[var(--primary)]/10 text-foreground"
                  : "border-border/80 bg-card text-muted-foreground hover:bg-muted"
              }`}
            >
              <CreditCard className="size-4" />
              <span>Credit / Debit</span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("bank")}
              className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-xs font-semibold transition-all ${
                paymentMethod === "bank"
                  ? "border-[var(--primary)] bg-[var(--primary)]/10 text-foreground"
                  : "border-border/80 bg-card text-muted-foreground hover:bg-muted"
              }`}
            >
              <Zap className="size-4" />
              <span>Bank Wire</span>
            </button>
          </div>
        </div>

        {/* Provider quote info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/40 pt-3">
          <span className="flex items-center gap-1">
            <ShieldCheck className="size-3.5 text-emerald-500" />
            <span>Best on-ramp via MoonPay &amp; Transak</span>
          </span>
          <span className="font-medium text-emerald-500">Zero Gateway Fee</span>
        </div>

        <Button
          onClick={handleBuy}
          disabled={isProcessing || parsedFiat < 10}
          className="bg-vault-gradient h-11 w-full rounded-xl font-bold text-white hover:opacity-95"
        >
          {isProcessing ? "Authorizing Payment..." : `Buy ${symbol} Now`}
        </Button>
      </div>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
