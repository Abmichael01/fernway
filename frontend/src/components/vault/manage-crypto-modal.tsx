"use client";

import { useState } from "react";
import { Plus, Search, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from "@/components/shared/responsive-modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SUPPORTED_TOKENS } from "@/config/vault";
import { CryptoIcon } from "./crypto-icon";
import type { VaultHolding } from "@/types/vault";

interface ManageCryptoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  holdings?: VaultHolding[];
}

export function ManageCryptoModal({ open, onOpenChange }: ManageCryptoModalProps) {
  const [tab, setTab] = useState<"manage" | "custom">("manage");
  const [search, setSearch] = useState("");
  const [enabledTokens, setEnabledTokens] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const sym of Object.keys(SUPPORTED_TOKENS)) {
      init[sym] = true;
    }
    return init;
  });

  // Custom token form state
  const [customNetwork, setCustomNetwork] = useState("Ethereum");
  const [contractAddress, setContractAddress] = useState("");
  const [customName, setCustomName] = useState("");
  const [customSymbol, setCustomSymbol] = useState("");
  const [customDecimals, setCustomDecimals] = useState("18");

  const toggleToken = (sym: string) => {
    setEnabledTokens((prev) => {
      const next = !prev[sym];
      toast.success(`${sym} ${next ? "enabled" : "hidden"} in wallet`);
      return { ...prev, [sym]: next };
    });
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractAddress.trim() || !customSymbol.trim()) {
      toast.error("Please fill in contract address and token symbol.");
      return;
    }
    toast.success(`Custom token ${customSymbol.toUpperCase()} added to Vault!`);
    setTab("manage");
    setContractAddress("");
    setCustomName("");
    setCustomSymbol("");
  };

  const tokenList = Object.entries(SUPPORTED_TOKENS).filter(([sym, data]) => {
    return (
      sym.toLowerCase().includes(search.toLowerCase()) ||
      data.name.toLowerCase().includes(search.toLowerCase()) ||
      data.network.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange}>
      <ResponsiveModalContent className="max-w-md p-6">
        <ResponsiveModalHeader>
          <div className="flex items-center gap-2">
            <span className="bg-vault-gradient grid size-8 place-items-center rounded-xl text-white">
              <SlidersHorizontal className="size-4" />
            </span>
            <ResponsiveModalTitle className="font-heading text-lg font-bold">
              {tab === "manage" ? "Manage Crypto" : "Add Custom Token"}
            </ResponsiveModalTitle>
          </div>
          <ResponsiveModalDescription className="text-xs text-muted-foreground mt-1">
            {tab === "manage"
              ? "Toggle visible tokens or import custom assets across all chains."
              : "Import an unlisted ERC-20, SPL, or BEP-20 token contract."}
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>

        {/* Tab Switcher */}
        <div className="mt-3 flex rounded-xl bg-muted/60 p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setTab("manage")}
            className={`flex-1 rounded-lg py-1.5 transition-colors ${
              tab === "manage" ? "bg-card text-foreground font-bold" : "text-muted-foreground"
            }`}
          >
            Token List
          </button>
          <button
            type="button"
            onClick={() => setTab("custom")}
            className={`flex-1 rounded-lg py-1.5 transition-colors ${
              tab === "custom" ? "bg-card text-foreground font-bold" : "text-muted-foreground"
            }`}
          >
            Add Custom Token
          </button>
        </div>

        {tab === "manage" ? (
          <div className="mt-4 flex flex-col gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, symbol, or network..."
                className="h-9 rounded-xl pl-8 text-xs"
              />
            </div>

            <div className="divide-y divide-border/60 max-h-[45vh] overflow-y-auto rounded-2xl border border-border/70 bg-card p-1">
              {tokenList.map(([sym, meta]) => {
                const isEnabled = enabledTokens[sym] ?? true;

                return (
                  <div key={sym} className="flex items-center justify-between p-3">
                    <div className="flex items-center gap-3">
                      <CryptoIcon symbol={sym} size={36} />
                      <div className="flex flex-col">
                        <span className="font-heading text-sm font-bold text-foreground">
                          {meta.name}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <span className="font-mono">{sym}</span>
                          <span>•</span>
                          <span>{meta.network}</span>
                        </div>
                      </div>
                    </div>
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={() => toggleToken(sym)}
                    />
                  </div>
                );
              })}
            </div>

            <Button
              variant="outline"
              onClick={() => setTab("custom")}
              className="mt-2 h-10 w-full rounded-xl text-xs font-bold gap-1.5"
            >
              <Plus className="size-3.5 text-primary" />
              <span>Import Custom Token by Contract</span>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleAddCustom} className="mt-4 flex flex-col gap-3.5">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Network</Label>
              <Select value={customNetwork} onValueChange={setCustomNetwork}>
                <SelectTrigger className="h-10 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Ethereum", "Solana", "BNB Smart Chain", "Polygon", "Base", "Arbitrum", "Avalanche"].map((n) => (
                    <SelectItem key={n} value={n}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Token Contract Address</Label>
              <Input
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
                placeholder="0x... or Base58 address"
                className="h-10 rounded-xl font-mono text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Token Name</Label>
                <Input
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Pepe"
                  className="h-10 rounded-xl text-xs"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Symbol</Label>
                <Input
                  value={customSymbol}
                  onChange={(e) => setCustomSymbol(e.target.value)}
                  placeholder="e.g. PEPE"
                  className="h-10 rounded-xl font-mono text-xs uppercase"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Decimals</Label>
              <Input
                value={customDecimals}
                onChange={(e) => setCustomDecimals(e.target.value)}
                placeholder="18"
                className="h-10 rounded-xl font-mono text-xs"
              />
            </div>

            <Button type="submit" className="mt-2 h-11 w-full rounded-xl font-bold">
              Import Token
            </Button>
          </form>
        )}
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
