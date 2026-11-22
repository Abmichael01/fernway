"use client";

import { useState } from "react";
import Image from "next/image";
import { BadgeCheck, Send } from "lucide-react";
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
import { formatMoney } from "@/lib/money";
import type { VaultNft } from "@/types/vault";

interface NftDetailDialogProps {
  nft: VaultNft | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NftDetailDialog({ nft, open, onOpenChange }: NftDetailDialogProps) {
  const [showTransfer, setShowTransfer] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [isSending, setIsSending] = useState(false);

  if (!nft) return null;

  const handleTransfer = () => {
    if (!recipient.trim()) {
      toast.error("Please enter a destination address");
      return;
    }
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      toast.success(`Collectible ${nft.name} transferred to ${recipient.slice(0, 8)}...`);
      setShowTransfer(false);
      onOpenChange(false);
    }, 1200);
  };

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange} desktop="dialog">
      <ResponsiveModalContent className="sm:max-w-md">
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>{nft.name}</ResponsiveModalTitle>
          <ResponsiveModalDescription>
            {nft.collection} · {nft.network}
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>

        <div className="flex flex-col gap-4 pt-2">
        {/* NFT Image */}
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-muted border border-border/60">
          <Image src={nft.imageUrl} alt={nft.name} fill sizes="400px" className="object-cover" unoptimized />
        </div>

        {/* Collection & Floor Info */}
        <div className="flex items-center justify-between rounded-xl bg-muted/40 p-3 text-xs">
          <div>
            <span className="text-muted-foreground">Floor Price</span>
            <p className="font-bold text-foreground text-sm font-mono">{nft.floorPrice}</p>
          </div>
          <div className="text-right">
            <span className="text-muted-foreground">Estimated Valuation</span>
            <p className="font-bold text-emerald-500 text-sm">
              {formatMoney(Math.round(nft.estimatedUsd * 100), "USD")}
            </p>
          </div>
        </div>

        {/* Specs */}
        <div className="flex flex-col gap-2 text-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Collection</span>
            <span className="font-semibold text-foreground flex items-center gap-1">
              <span>{nft.collection}</span>
              <BadgeCheck className="size-3 text-[var(--primary)]" />
            </span>
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Token ID</span>
            <span className="font-mono font-semibold text-foreground">#{nft.tokenId}</span>
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Blockchain</span>
            <span className="font-semibold text-foreground">{nft.network}</span>
          </div>
        </div>

        {/* Transfer form / Action */}
        {showTransfer ? (
          <div className="flex flex-col gap-3 rounded-xl border border-border/80 p-3 pt-2">
            <Label className="text-xs">Destination Address</Label>
            <Input
              placeholder="0x... or Solana address"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="h-10 text-xs font-mono"
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTransfer(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleTransfer}
                disabled={isSending || !recipient}
                className="bg-[var(--primary)] flex-1 text-white hover:bg-[var(--primary)]/90"
              >
                {isSending ? "Transferring..." : "Confirm Transfer"}
              </Button>
            </div>
          </div>
        ) : (
          <Button
            onClick={() => setShowTransfer(true)}
            variant="outline"
            className="h-11 rounded-xl font-semibold gap-1.5"
          >
            <Send className="size-4" />
            <span>Transfer Collectible</span>
          </Button>
        )}
      </div>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
