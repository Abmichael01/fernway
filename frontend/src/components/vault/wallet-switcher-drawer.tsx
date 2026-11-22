"use client";

import { Check, Copy, Plus, ShieldCheck, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from "@/components/shared/responsive-modal";
import { useWallets } from "@/hooks/vault/useVault";

interface WalletSwitcherDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeWalletId?: string;
  onSelectWallet: (walletId: string) => void;
  onOpenAddWallet: () => void;
}

export function WalletSwitcherDrawer({
  open,
  onOpenChange,
  activeWalletId,
  onSelectWallet,
  onOpenAddWallet,
}: WalletSwitcherDrawerProps) {
  const { data, isPending } = useWallets();
  const wallets = data?.wallets ?? [];

  const copyAddress = (addr: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(addr);
    toast.success("Wallet address copied to clipboard");
  };

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange}>
      <ResponsiveModalContent className="max-w-md p-6">
        <ResponsiveModalHeader>
          <div className="flex items-center gap-2">
            <span className="bg-vault-gradient grid size-8 place-items-center rounded-xl text-white">
              <Wallet className="size-4" />
            </span>
            <ResponsiveModalTitle className="font-heading text-lg font-bold">
              Wallets
            </ResponsiveModalTitle>
          </div>
          <ResponsiveModalDescription className="text-xs text-muted-foreground mt-1">
            Trust Wallet multi-chain self-custody. Switch between active accounts or create a new wallet.
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>

        <div className="mt-4 flex flex-col gap-2 max-h-[50vh] overflow-y-auto">
          {isPending ? (
            <div className="p-6 text-center text-xs text-muted-foreground">Loading wallets...</div>
          ) : wallets.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">No wallets found.</div>
          ) : (
            wallets.map((w) => {
              const isActive = w.id === activeWalletId;
              const shortAddr = `${w.evmAddress.slice(0, 6)}...${w.evmAddress.slice(-4)}`;

              return (
                <div
                  key={w.id}
                  onClick={() => {
                    onSelectWallet(w.id);
                    onOpenChange(false);
                  }}
                  className={`group flex items-center justify-between rounded-2xl border p-3.5 cursor-pointer transition-all ${
                    isActive
                      ? "border-primary bg-primary/5"
                      : "border-border/70 bg-card hover:border-primary/50 hover:bg-muted/30"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`grid size-10 shrink-0 place-items-center rounded-xl ${
                        isActive
                          ? "bg-primary text-white"
                          : "bg-muted text-muted-foreground group-hover:text-foreground"
                      }`}
                    >
                      <ShieldCheck className="size-5" />
                    </span>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-heading text-sm font-bold text-foreground">
                          {w.name}
                        </span>
                        {w.isLinked ? (
                          <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px]">
                            Linked
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground text-[10px]">
                            Vault
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono mt-0.5">
                        <span>{shortAddr}</span>
                        <button
                          type="button"
                          onClick={(e) => copyAddress(w.evmAddress, e)}
                          className="text-muted-foreground hover:text-foreground p-0.5 rounded"
                          title="Copy Address"
                        >
                          <Copy className="size-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {isActive && (
                    <span className="grid size-6 place-items-center rounded-full bg-primary text-white">
                      <Check className="size-3.5" />
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Add Wallet Button */}
        <Button
          onClick={() => {
            onOpenChange(false);
            onOpenAddWallet();
          }}
          className="mt-4 h-11 w-full rounded-xl font-bold gap-2"
        >
          <Plus className="size-4" />
          <span>Add New Wallet</span>
        </Button>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
