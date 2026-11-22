"use client";

import { useState } from "react";
import { Flame } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { VaultHolding } from "@/types/vault";
import { useSendCrypto } from "@/hooks/vault/useVault";
import { SUPPORTED_TOKENS } from "@/config/vault";
import { CryptoIcon } from "./crypto-icon";

interface SendCryptoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  holdings: VaultHolding[];
  initialSymbol?: string;
}

export function SendCryptoDialog({
  open,
  onOpenChange,
  holdings,
  initialSymbol = "ETH",
}: SendCryptoDialogProps) {
  const [symbol, setSymbol] = useState(initialSymbol);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [gasSpeed, setGasSpeed] = useState<"standard" | "fast" | "instant">("standard");

  const sendMutation = useSendCrypto();

  const activeHolding = holdings.find((h) => h.symbol === symbol) ?? holdings[0];
  const available = activeHolding?.amount ?? 0;
  const parsedAmount = parseFloat(amount) || 0;
  const tokenMeta = SUPPORTED_TOKENS[symbol];

  const handleMax = () => {
    setAmount(available.toString());
  };

  const handleSend = () => {
    if (!recipient.trim()) {
      toast.error("Please enter a valid recipient address or ENS name");
      return;
    }
    if (parsedAmount <= 0) {
      toast.error("Please enter an amount to send");
      return;
    }
    if (parsedAmount > available) {
      toast.error(`Insufficient ${symbol} balance`);
      return;
    }

    sendMutation.mutate(
      {
        symbol,
        amount: parsedAmount,
        toAddress: recipient.trim(),
        network: activeHolding?.network ?? "Ethereum",
      },
      {
        onSuccess: () => {
          toast.success(`Transferred ${parsedAmount} ${symbol} successfully!`);
          onOpenChange(false);
          setRecipient("");
          setAmount("");
        },
        onError: (err) => {
          toast.error(err.message || "Transfer failed");
        },
      },
    );
  };

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange} desktop="dialog">
      <ResponsiveModalContent className="sm:max-w-md">
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>Send {symbol}</ResponsiveModalTitle>
          <ResponsiveModalDescription>
            Transfer digital assets instantly across supported blockchains.
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>

        <div className="flex flex-col gap-5 pt-2">
        {/* Token selection */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Asset to Send</Label>
          <Select value={symbol} onValueChange={setSymbol}>
            <SelectTrigger className="h-11 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {holdings.map((h) => (
                <SelectItem key={h.symbol} value={h.symbol}>
                  <div className="flex items-center justify-between w-full gap-4">
                    <div className="flex items-center gap-2">
                      <CryptoIcon symbol={h.symbol} size={20} />
                      <span>
                        {h.name} ({h.symbol})
                      </span>
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">
                      {h.amount} {h.symbol}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Recipient input */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <Label className="text-xs">Recipient Address / ENS</Label>
            <button
              type="button"
              onClick={async () => {
                const text = await navigator.clipboard.readText().catch(() => "");
                if (text) setRecipient(text);
              }}
              className="text-[var(--primary)] hover:underline"
            >
              Paste
            </button>
          </div>
          <Input
            placeholder="0x... or ENS name or Solana address"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="h-11 rounded-xl font-mono text-xs"
          />
        </div>

        {/* Amount */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <Label className="text-xs">Amount</Label>
            <div className="flex items-center gap-1.5">
              <span>Available: {available} {symbol}</span>
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
          <span className="text-xs text-muted-foreground">
            ≈ ${(parsedAmount * (tokenMeta?.price ?? 0)).toLocaleString("en-US", { minimumFractionDigits: 2 })} USD
          </span>
        </div>

        {/* Network Fee Tier */}
        <div className="flex flex-col gap-2 rounded-xl border border-border/60 bg-muted/30 p-3 text-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="flex items-center gap-1">
              <Flame className="size-3.5 text-amber-500" />
              <span>Network Speed</span>
            </span>
            <div className="flex items-center gap-1">
              {(["standard", "fast", "instant"] as const).map((tier) => (
                <button
                  key={tier}
                  type="button"
                  onClick={() => setGasSpeed(tier)}
                  className={`capitalize rounded-lg px-2.5 py-0.5 text-[11px] font-semibold transition-colors ${
                    gasSpeed === tier
                      ? "bg-primary text-white"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between text-muted-foreground pt-1 border-t border-border/40">
            <span>Estimated Network Fee</span>
            <span className="font-semibold text-emerald-500">
              {gasSpeed === "standard" ? "$0.85" : gasSpeed === "fast" ? "$1.20" : "$1.85"}
            </span>
          </div>
        </div>

        <Button
          onClick={handleSend}
          disabled={sendMutation.isPending || parsedAmount <= 0 || parsedAmount > available}
          className="bg-vault-gradient mt-2 h-11 w-full rounded-xl font-bold text-white hover:opacity-95"
        >
          {sendMutation.isPending ? "Broadcasting to Blockchain..." : `Send ${symbol}`}
        </Button>
      </div>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
