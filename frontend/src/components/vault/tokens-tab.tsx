"use client";

import { useState } from "react";
import { Plus, Search, SlidersHorizontal, Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import { formatMoney } from "@/lib/money";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CryptoNetwork, VaultHolding } from "@/types/vault";
import { CryptoIcon } from "./crypto-icon";

interface TokensTabProps {
  holdings: VaultHolding[];
  selectedNetwork: CryptoNetwork;
  onSelectToken: (holding: VaultHolding) => void;
  onManageCrypto?: () => void;
}

export function TokensTab({
  holdings,
  selectedNetwork,
  onSelectToken,
  onManageCrypto,
}: TokensTabProps) {
  const [search, setSearch] = useState("");

  const filtered = holdings.filter((h) => {
    const matchesSearch =
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.symbol.toLowerCase().includes(search.toLowerCase());
    const matchesNetwork = selectedNetwork === "All Networks" || h.network === selectedNetwork;
    return matchesSearch && matchesNetwork;
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Search Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search 1,000+ tokens, symbols..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 rounded-xl bg-card pl-9 text-xs sm:text-sm border-border/80"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onManageCrypto}
          className="h-10 gap-1.5 rounded-xl border-border/80 px-3 text-xs font-semibold"
          title="Manage visible crypto tokens"
        >
          <SlidersHorizontal className="size-3.5" />
          <span className="hidden min-[380px]:inline">Manage</span>
        </Button>
      </div>

      {/* Token List */}
      <div className="divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/80 bg-card dark:bg-[#0E121A]">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-sm text-muted-foreground">
            <p>No tokens found matching &quot;{search}&quot;</p>
          </div>
        ) : (
          filtered.map((holding) => {
            const isPositive = holding.change24h >= 0;
            const totalCoin = holding.amount + holding.stakedAmount;
            const valueCents = Math.round(holding.valueUsd * 100);
            const sparkline = holding.sparkline || [1, 1.02, 0.99, 1.05, 1.08];

            return (
              <button
                key={holding.id}
                type="button"
                onClick={() => onSelectToken(holding)}
                className="group flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-muted/50 sm:px-5"
              >
                {/* Left: Real SVG Trading Icon + Name + Network Badge + Price */}
                <div className="flex items-center gap-3.5">
                  <CryptoIcon symbol={holding.symbol} size={42} />

                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-bold text-foreground group-hover:text-primary transition-colors">
                        {holding.name}
                      </span>
                      <span className="text-xs font-mono font-medium text-muted-foreground">
                        {holding.symbol}
                      </span>
                      {holding.stakedAmount > 0 && (
                        <Badge
                          variant="outline"
                          className="h-4 gap-0.5 border-emerald-500/30 px-1 text-[10px] text-emerald-500 font-bold"
                        >
                          <Sparkles className="size-2.5" />
                          <span>Staked</span>
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                      <span className="font-mono">
                        ${holding.price.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 4,
                        })}
                      </span>
                      <span
                        className={`inline-flex items-center gap-0.5 font-semibold ${
                          isPositive ? "text-emerald-500" : "text-rose-500"
                        }`}
                      >
                        {isPositive ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                        <span>
                          {isPositive ? "+" : ""}
                          {holding.change24h.toFixed(2)}%
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Center: Sparkline (visible on sm+) */}
                <div className="hidden md:flex items-center justify-center w-20 h-6">
                  <svg viewBox="0 0 80 24" className="w-full h-full overflow-visible">
                    <polyline
                      fill="none"
                      stroke={isPositive ? "#10b981" : "#f43f5e"}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={sparkline
                        .map((val, i) => {
                          const x = (i / (sparkline.length - 1)) * 76 + 2;
                          const min = Math.min(...sparkline);
                          const max = Math.max(...sparkline);
                          const range = max - min || 1;
                          const y = 20 - ((val - min) / range) * 16;
                          return `${x},${y}`;
                        })
                        .join(" ")}
                    />
                  </svg>
                </div>

                {/* Right: Balance + USD Value */}
                <div className="flex flex-col items-end text-right">
                  <span className="font-heading font-bold text-foreground">
                    {formatMoney(valueCents, "USD")}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">
                    {totalCoin.toLocaleString("en-US", {
                      minimumFractionDigits: totalCoin < 1 ? 4 : 2,
                      maximumFractionDigits: totalCoin < 1 ? 6 : 4,
                    })}{" "}
                    {holding.symbol}
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Trust Wallet style "Manage Crypto" bottom action */}
      <button
        type="button"
        onClick={onManageCrypto}
        className="mx-auto flex items-center gap-2 rounded-xl border border-border/80 bg-card px-4 py-2 text-xs font-bold text-muted-foreground hover:border-primary hover:text-foreground transition-all active:scale-95"
      >
        <Plus className="size-3.5 text-primary" />
        <span>Manage Crypto / Add Custom Token</span>
      </button>
    </div>
  );
}
