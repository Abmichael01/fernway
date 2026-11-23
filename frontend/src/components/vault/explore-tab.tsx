"use client";

import { useState } from "react";
import { ExternalLink, Globe, Search, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { POPULAR_DAPPS } from "@/config/vault";

export function ExploreTab({ evmAddress }: { evmAddress: string }) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeDapp, setActiveDapp] = useState<(typeof POPULAR_DAPPS)[0] | null>(null);

  const categories = ["All", "DEX", "Lending", "NFT"];

  const filtered = POPULAR_DAPPS.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "All" || d.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleConnectDapp = (dapp: (typeof POPULAR_DAPPS)[0]) => {
    setActiveDapp(dapp);
    toast.success(`Connected Lindenway Vault to ${dapp.name}`);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Featured Web3 Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-r from-[var(--primary)]/20 via-[#14F195]/10 to-card p-6 dark:bg-[#0E121A] sm:p-7">
        <div className="relative z-10 flex flex-col gap-2 max-w-lg">
          <Badge className="w-fit bg-[var(--primary)] text-white">Web3 Gateway</Badge>
          <h3 className="font-heading text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Explore Decentralized Apps
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Connect your self-custody Lindenway Vault wallet seamlessly to decentralized exchanges, NFT markets, and lending protocols across Ethereum, Solana and BNB Chain.
          </p>
        </div>
      </div>

      {/* Search & Categories */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search dApps or enter URL..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 rounded-xl bg-card pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`rounded-xl px-3.5 py-1 text-xs font-semibold transition-colors ${
                activeCategory === cat
                  ? "bg-[var(--primary)] text-white"
                  : "border border-border/80 bg-card text-muted-foreground hover:bg-muted"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* dApps Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((dapp) => (
          <div
            key={dapp.id}
            className="flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-4 dark:bg-[#0E121A]"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-2xl bg-muted/80 text-2xl">
                    {dapp.icon}
                  </span>
                  <div>
                    <h5 className="font-bold text-foreground">{dapp.name}</h5>
                    <span className="text-[11px] font-medium text-muted-foreground">
                      {dapp.category} · {dapp.network}
                    </span>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] text-muted-foreground">
                  TVL: {dapp.tvl}
                </Badge>
              </div>

              <p className="mt-2.5 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                {dapp.description}
              </p>
            </div>

            <div className="mt-3.5 flex items-center justify-between border-t border-border/40 pt-2.5">
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Globe className="size-3" />
                <span>{dapp.url.replace("https://", "")}</span>
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleConnectDapp(dapp)}
                className="h-7 rounded-xl gap-1 text-xs font-semibold hover:border-primary hover:text-primary"
              >
                <span>Connect</span>
                <ExternalLink className="size-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Active dApp connection banner */}
      {activeDapp && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-emerald-500" />
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                Connected to {activeDapp.name}
              </span>
              <span className="text-muted-foreground">({evmAddress.slice(0, 6)}...{evmAddress.slice(-4)})</span>
            </div>
            <button
              type="button"
              onClick={() => setActiveDapp(null)}
              className="text-muted-foreground hover:text-foreground underline"
            >
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
