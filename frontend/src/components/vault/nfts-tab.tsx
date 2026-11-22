"use client";

import { useState } from "react";
import Image from "next/image";
import { BadgeCheck, Sparkles } from "lucide-react";
import { formatMoney } from "@/lib/money";
import { Badge } from "@/components/ui/badge";
import type { VaultNft } from "@/types/vault";

interface NftsTabProps {
  nfts: VaultNft[];
  onSelectNft: (nft: VaultNft) => void;
}

export function NftsTab({ nfts, onSelectNft }: NftsTabProps) {
  const [selectedCollection, setSelectedCollection] = useState<string>("All");

  const collections = ["All", ...Array.from(new Set(nfts.map((n) => n.collection)))];

  const filtered =
    selectedCollection === "All"
      ? nfts
      : nfts.filter((n) => n.collection === selectedCollection);

  return (
    <div className="flex flex-col gap-5">
      {/* Collection Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
        {collections.map((col) => (
          <button
            key={col}
            type="button"
            onClick={() => setSelectedCollection(col)}
            className={`whitespace-nowrap rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
              selectedCollection === col
                ? "bg-primary text-white"
                : "border border-border/80 bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {col}
          </button>
        ))}
      </div>

      {/* NFT Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-12 text-center">
          <Sparkles className="size-8 text-muted-foreground/60" />
          <p className="mt-3 text-sm font-medium text-foreground">No digital collectibles</p>
          <p className="text-xs text-muted-foreground">NFTs stored in this vault will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((nft) => (
            <button
              key={nft.id}
              type="button"
              onClick={() => onSelectNft(nft)}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card text-left transition-colors hover:border-primary dark:bg-[#0E121A]"
            >
              {/* NFT Image */}
              <div className="relative aspect-square w-full overflow-hidden bg-muted">
                <Image
                  src={nft.imageUrl}
                  alt={nft.name}
                  fill
                  sizes="(max-width: 640px) 50vw, 33vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  unoptimized
                />
                <Badge className="absolute left-2.5 top-2.5 bg-black/60 backdrop-blur-md text-[10px] text-white border-none">
                  {nft.network}
                </Badge>
              </div>

              {/* Info */}
              <div className="flex flex-1 flex-col justify-between p-3.5">
                <div>
                  <div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                    <span className="truncate">{nft.collection}</span>
                    <BadgeCheck className="size-3 text-[var(--primary)]" />
                  </div>
                  <h4 className="mt-0.5 truncate text-sm font-bold text-foreground">{nft.name}</h4>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-2 text-xs">
                  <span className="text-muted-foreground text-[10px]">Floor Value</span>
                  <div className="flex flex-col items-end">
                    <span className="font-semibold text-foreground font-mono">{nft.floorPrice}</span>
                    <span className="text-[10px] text-muted-foreground">
                      ≈ {formatMoney(Math.round(nft.estimatedUsd * 100), "USD")}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
