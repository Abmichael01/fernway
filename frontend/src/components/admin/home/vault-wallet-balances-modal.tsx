"use client";

import { useState } from "react";
import {
  Coins,
  Edit2,
  PlusCircle,
  RefreshCw,
  Save,
} from "lucide-react";
import { toast } from "sonner";
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
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from "@/components/shared/responsive-modal";
import { CryptoIcon } from "@/components/vault/crypto-icon";
import { formatMoney } from "@/lib/money";
import {
  useAdminWalletDetails,
  useAdminSetWalletHolding,
} from "@/hooks/vault/useVault";
import { SUPPORTED_TOKENS } from "@/config/vault";
import type { AdminVaultWalletItem, VaultHolding } from "@/types/vault";

interface VaultWalletBalancesModalProps {
  wallet: AdminVaultWalletItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NETWORKS = [
  "Ethereum",
  "Solana",
  "Bitcoin",
  "BNB Smart Chain",
  "Polygon",
  "Avalanche",
  "Base",
  "Arbitrum",
];

export function VaultWalletBalancesModal({
  wallet,
  open,
  onOpenChange,
}: VaultWalletBalancesModalProps) {
  const { data: details, isLoading, refetch } = useAdminWalletDetails(wallet?.id);
  const setHoldingMutation = useAdminSetWalletHolding();

  // Selected coin form
  const [selectedPreset, setSelectedPreset] = useState("BTC");
  const [customSymbol, setCustomSymbol] = useState("");
  const [customName, setCustomName] = useState("");
  const [network, setNetwork] = useState("Bitcoin");
  const [liquidAmount, setLiquidAmount] = useState("");
  const [stakedAmount, setStakedAmount] = useState("");

  const holdings = details?.holdings ?? [];

  const handleSelectPreset = (val: string) => {
    setSelectedPreset(val);
    if (val === "CUSTOM") {
      setCustomSymbol("");
      setCustomName("");
      setLiquidAmount("");
      setStakedAmount("");
      setNetwork("Ethereum");
      return;
    }

    const token = SUPPORTED_TOKENS[val];
    if (token) {
      setNetwork(token.network);
      // If this wallet already has this token, pre-fill its balances
      const existing = holdings.find((h) => h.symbol.toUpperCase() === val.toUpperCase());
      if (existing) {
        setLiquidAmount(existing.amount.toString());
        setStakedAmount(existing.stakedAmount.toString());
      } else {
        setLiquidAmount("");
        setStakedAmount("0");
      }
    }
  };

  const handleQuickEditHolding = (h: VaultHolding) => {
    if (SUPPORTED_TOKENS[h.symbol.toUpperCase()]) {
      setSelectedPreset(h.symbol.toUpperCase());
    } else {
      setSelectedPreset("CUSTOM");
      setCustomSymbol(h.symbol);
      setCustomName(h.name);
    }
    setNetwork(h.network);
    setLiquidAmount(h.amount.toString());
    setStakedAmount(h.stakedAmount.toString());
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet) return;

    const symbol =
      selectedPreset === "CUSTOM"
        ? customSymbol.trim().toUpperCase()
        : selectedPreset.trim().toUpperCase();

    if (!symbol) {
      toast.error("Please enter or select a coin symbol.");
      return;
    }

    if (!liquidAmount.trim()) {
      toast.error("Please specify a liquid balance amount.");
      return;
    }

    const amountNum = parseFloat(liquidAmount);
    if (isNaN(amountNum) || amountNum < 0) {
      toast.error("Liquid amount must be a positive number.");
      return;
    }

    const stakedNum = stakedAmount.trim() ? parseFloat(stakedAmount) : 0;
    if (isNaN(stakedNum) || stakedNum < 0) {
      toast.error("Staked amount must be a positive number.");
      return;
    }

    const tokenName =
      selectedPreset === "CUSTOM"
        ? customName.trim() || symbol
        : SUPPORTED_TOKENS[symbol]?.name || symbol;

    try {
      await setHoldingMutation.mutateAsync({
        walletId: wallet.id,
        data: {
          symbol,
          amount: amountNum.toString(),
          stakedAmount: stakedNum.toString(),
          network,
          name: tokenName,
        },
      });

      toast.success(`Successfully set ${symbol} balance to ${amountNum} (staked: ${stakedNum})!`);
      void refetch();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update holding");
    }
  };

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange}>
      <ResponsiveModalContent className="max-w-2xl p-6">
        <ResponsiveModalHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="grid size-8 place-items-center rounded-xl bg-amber-500/10 text-amber-500">
                <Coins className="size-4" />
              </div>
              <div>
                <ResponsiveModalTitle className="text-base font-bold">
                  Manage Coin Balances & Staking
                </ResponsiveModalTitle>
                <ResponsiveModalDescription className="text-xs">
                  Set live balances for any coin or token in {wallet?.name || "this wallet"}.
                </ResponsiveModalDescription>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => void refetch()}
              className="h-8 gap-1 rounded-xl text-xs"
            >
              <RefreshCw className="size-3" />
              <span>Refresh</span>
            </Button>
          </div>
        </ResponsiveModalHeader>

        <div className="mt-4 flex flex-col gap-6">
          {/* Summary Banner */}
          <div className="grid grid-cols-2 gap-3 rounded-2xl border border-border/80 bg-muted/20 p-3.5">
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase">
                Total Portfolio Value
              </p>
              <p className="text-lg font-bold font-heading text-foreground mt-0.5">
                {formatMoney(Math.round((details?.totalValueUsd ?? wallet?.totalValueUsd ?? 0) * 100), "USD")}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase">
                Total Staked Yield
              </p>
              <p className="text-lg font-bold font-heading text-emerald-500 mt-0.5">
                {formatMoney(Math.round((details?.totalStakedUsd ?? wallet?.totalStakedUsd ?? 0) * 100), "USD")}
              </p>
            </div>
          </div>

          {/* Current Holdings List */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-foreground">Current Assets in Wallet</Label>
              <span className="text-[11px] text-muted-foreground">
                {holdings.length} active holdings
              </span>
            </div>

            {isLoading ? (
              <div className="p-6 text-center text-xs text-muted-foreground">
                Loading wallet assets...
              </div>
            ) : holdings.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/80 p-4 text-center text-xs text-muted-foreground">
                No coin balances yet. Use the form below to add coins to this wallet.
              </div>
            ) : (
              <div className="max-h-52 overflow-y-auto rounded-xl border border-border/80 divide-y divide-border/60">
                {holdings.map((h) => {
                  return (
                    <div
                      key={h.id}
                      className="flex items-center justify-between p-2.5 hover:bg-muted/30 text-xs transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <CryptoIcon symbol={h.symbol} size={28} />
                        <div>
                          <p className="font-bold text-foreground leading-none">{h.name}</p>
                          <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
                            {h.symbol} · {h.network}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-mono font-bold text-foreground">
                            {h.amount} {h.symbol}
                          </p>
                          {h.stakedAmount > 0 && (
                            <p className="text-[10px] font-mono font-medium text-emerald-500">
                              +{h.stakedAmount} staked
                            </p>
                          )}
                        </div>

                        <div className="text-right min-w-[70px]">
                          <p className="font-mono font-semibold text-muted-foreground">
                            {formatMoney(Math.round(h.valueUsd * 100), "USD")}
                          </p>
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleQuickEditHolding(h)}
                          className="h-7 w-7 p-0 rounded-lg text-muted-foreground hover:text-foreground"
                          title={`Edit ${h.symbol} balance`}
                        >
                          <Edit2 className="size-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Form to Set / Add Coin Balance */}
          <form
            onSubmit={handleSave}
            className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-card p-4 shadow-xs"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
              <PlusCircle className="size-3.5 text-primary" />
              <span>Set or Update Coin Balance</span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Select Coin / Asset</Label>
                <Select value={selectedPreset} onValueChange={handleSelectPreset}>
                  <SelectTrigger className="h-10 rounded-xl text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(SUPPORTED_TOKENS).map((t) => (
                      <SelectItem key={t.symbol} value={t.symbol}>
                        {t.name} ({t.symbol})
                      </SelectItem>
                    ))}
                    <SelectItem value="CUSTOM">+ Custom Coin / Token</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Network / Chain</Label>
                <Select value={network} onValueChange={setNetwork}>
                  <SelectTrigger className="h-10 rounded-xl text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {NETWORKS.map((net) => (
                      <SelectItem key={net} value={net}>
                        {net}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedPreset === "CUSTOM" && (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs">Custom Symbol</Label>
                  <Input
                    placeholder="e.g. PEPE or NEAR"
                    value={customSymbol}
                    onChange={(e) => setCustomSymbol(e.target.value.toUpperCase())}
                    className="h-10 rounded-xl font-mono text-xs uppercase"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs">Token Name</Label>
                  <Input
                    placeholder="e.g. Pepe Coin"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="h-10 rounded-xl text-xs"
                  />
                </div>
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Liquid Amount (Available)</Label>
                <Input
                  type="number"
                  step="any"
                  placeholder="e.g. 5.50"
                  value={liquidAmount}
                  onChange={(e) => setLiquidAmount(e.target.value)}
                  className="h-10 rounded-xl font-mono text-xs"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Staked Amount (Earning Yield)</Label>
                <Input
                  type="number"
                  step="any"
                  placeholder="e.g. 1.25 (optional)"
                  value={stakedAmount}
                  onChange={(e) => setStakedAmount(e.target.value)}
                  className="h-10 rounded-xl font-mono text-xs"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={setHoldingMutation.isPending}
              className="mt-2 h-10 gap-1.5 rounded-xl font-bold text-xs"
            >
              <Save className="size-3.5" />
              <span>
                {setHoldingMutation.isPending
                  ? "Saving Balance..."
                  : `Save ${selectedPreset === "CUSTOM" ? customSymbol || "Token" : selectedPreset} Balance`}
              </span>
            </Button>
          </form>
        </div>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
