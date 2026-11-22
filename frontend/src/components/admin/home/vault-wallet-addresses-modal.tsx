"use client";

import { useState } from "react";
import { Copy, ShieldCheck } from "lucide-react";
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
import { useAdminUpdateWalletAddresses } from "@/hooks/vault/useVault";
import type { AdminVaultWalletItem } from "@/types/vault";

const DESIGNATED_NETWORKS = [
  { id: "Ethereum", label: "Ethereum (ERC-20)" },
  { id: "Bitcoin", label: "Bitcoin (Native SegWit)" },
  { id: "Solana", label: "Solana (SPL)" },
  { id: "BNB Smart Chain", label: "BNB Smart Chain (BEP-20)" },
  { id: "Polygon", label: "Polygon (PoS)" },
  { id: "Tron", label: "Tron (TRC-20)" },
  { id: "Arbitrum", label: "Arbitrum One" },
  { id: "Base", label: "Base L2" },
  { id: "Avalanche", label: "Avalanche (C-Chain)" },
  { id: "Dogecoin", label: "Dogecoin (DOGE)" },
  { id: "Litecoin", label: "Litecoin (LTC)" },
  { id: "XRP", label: "Ripple (XRP)" },
  { id: "Custom", label: "Custom Chain (Type Any Network...)" },
];

interface VaultWalletAddressesModalProps {
  wallet: AdminVaultWalletItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function AddressesForm({
  wallet,
  onOpenChange,
}: {
  wallet: AdminVaultWalletItem;
  onOpenChange: (open: boolean) => void;
}) {
  const updateMutation = useAdminUpdateWalletAddresses();

  const isKnown = DESIGNATED_NETWORKS.some(
    (n) => n.id === (wallet.designatedNetwork || "Ethereum") && n.id !== "Custom"
  );

  const [name, setName] = useState(wallet.name || "");
  const [email, setEmail] = useState(wallet.email || "");
  const [selectedNetworkChoice, setSelectedNetworkChoice] = useState(
    isKnown ? wallet.designatedNetwork || "Ethereum" : "Custom"
  );
  const [customNetworkName, setCustomNetworkName] = useState(
    !isKnown && wallet.designatedNetwork ? wallet.designatedNetwork : ""
  );
  const [designatedAddress, setDesignatedAddress] = useState(wallet.designatedAddress || "");

  const [evmAddress, setEvmAddress] = useState(wallet.evmAddress || "");
  const [solanaAddress, setSolanaAddress] = useState(wallet.solanaAddress || "");
  const [bitcoinAddress, setBitcoinAddress] = useState(wallet.bitcoinAddress || "");

  const effectiveNetwork =
    selectedNetworkChoice === "Custom"
      ? customNetworkName.trim() || "Custom Network"
      : selectedNetworkChoice;

  const copyText = (val: string, label: string) => {
    if (!val) return;
    navigator.clipboard.writeText(val);
    toast.success(`${label} copied`);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Wallet label cannot be empty.");
      return;
    }

    try {
      await updateMutation.mutateAsync({
        walletId: wallet.id,
        data: {
          name: name.trim(),
          email: email.trim() || undefined,
          designatedNetwork: effectiveNetwork,
          designatedAddress: designatedAddress.trim() || undefined,
          evmAddress: evmAddress.trim() || "0x71C8409391E606cD20689eB4D8D2513f5c8893B9",
          solanaAddress: solanaAddress.trim() || undefined,
          bitcoinAddress: bitcoinAddress.trim() || undefined,
        },
      });

      toast.success(`Designated chain set to ${effectiveNetwork}! Addresses updated.`);
      onOpenChange(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update addresses");
    }
  };

  return (
    <form onSubmit={handleSave} className="mt-4 flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs font-semibold">Wallet Label / Name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Primary Trading Vault"
            className="h-10 rounded-xl text-xs"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-xs font-semibold">Associated Email (Optional)</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. user@vault.finance"
            className="h-10 rounded-xl text-xs"
          />
        </div>
      </div>

      {/* Mandatory Designated Network stated by Admin */}
      <div className="flex flex-col gap-3 rounded-2xl border border-primary/40 bg-primary/5 p-4">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-bold text-foreground">
            Designated Deposit Chain (Mandatory for Users)
          </Label>
          <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary">
            Admin Controlled
          </span>
        </div>

        <Select value={selectedNetworkChoice} onValueChange={setSelectedNetworkChoice}>
          <SelectTrigger className="h-10 rounded-xl bg-card text-xs">
            <SelectValue placeholder="Select designated network" />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            {DESIGNATED_NETWORKS.map((n) => (
              <SelectItem key={n.id} value={n.id} className="text-xs">
                {n.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedNetworkChoice === "Custom" && (
          <div className="flex flex-col gap-1.5">
            <Label className="text-[11px] font-semibold text-foreground">
              Custom Network Name
            </Label>
            <Input
              value={customNetworkName}
              onChange={(e) => setCustomNetworkName(e.target.value)}
              placeholder="e.g. Toncoin (TON), Near, Kaspa, Aptos, Tron (TRC-20)..."
              className="h-10 rounded-xl bg-card text-xs"
            />
          </div>
        )}

        {/* Dedicated Address for the Designated Chain */}
        <div className="flex flex-col gap-1.5 pt-1">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold text-foreground">
              Deposit & Receiving Address for {effectiveNetwork}
            </Label>
            {designatedAddress && (
              <button
                type="button"
                onClick={() => copyText(designatedAddress, `${effectiveNetwork} Address`)}
                className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
              >
                <Copy className="size-3" />
                <span>Copy</span>
              </button>
            )}
          </div>
          <Input
            value={designatedAddress}
            onChange={(e) => setDesignatedAddress(e.target.value)}
            placeholder={`Enter ${effectiveNetwork} address (or leave empty to use multi-chain addresses below)...`}
            className="h-10 rounded-xl font-mono text-xs bg-card"
          />
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            The user deposit screen and scannable QR code will be strictly locked to <strong>{effectiveNetwork}</strong> with this address.
          </p>
        </div>
      </div>

      {/* Multi-chain backup addresses */}
      <div className="rounded-xl border border-border/70 p-3 bg-muted/20 flex flex-col gap-3">
        <p className="text-xs font-bold text-foreground">Multi-Chain Master Addresses</p>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-[11px] font-medium text-muted-foreground">
              EVM Address (ETH / BNB / Polygon / Arbitrum / Base)
            </Label>
            {evmAddress && (
              <button
                type="button"
                onClick={() => copyText(evmAddress, "EVM Address")}
                className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground"
              >
                <Copy className="size-3" />
                <span>Copy</span>
              </button>
            )}
          </div>
          <Input
            value={evmAddress}
            onChange={(e) => setEvmAddress(e.target.value)}
            placeholder="0x..."
            className="h-9 rounded-xl font-mono text-xs"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-[11px] font-medium text-muted-foreground">
              Solana Address (SPL)
            </Label>
            {solanaAddress && (
              <button
                type="button"
                onClick={() => copyText(solanaAddress, "Solana Address")}
                className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground"
              >
                <Copy className="size-3" />
                <span>Copy</span>
              </button>
            )}
          </div>
          <Input
            value={solanaAddress}
            onChange={(e) => setSolanaAddress(e.target.value)}
            placeholder="Base58 Solana address..."
            className="h-9 rounded-xl font-mono text-xs"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-[11px] font-medium text-muted-foreground">
              Bitcoin Address (Native SegWit / Taproot)
            </Label>
            {bitcoinAddress && (
              <button
                type="button"
                onClick={() => copyText(bitcoinAddress, "Bitcoin Address")}
                className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground"
              >
                <Copy className="size-3" />
                <span>Copy</span>
              </button>
            )}
          </div>
          <Input
            value={bitcoinAddress}
            onChange={(e) => setBitcoinAddress(e.target.value)}
            placeholder="bc1q... or 1... address"
            className="h-9 rounded-xl font-mono text-xs"
          />
        </div>
      </div>

      <div className="rounded-xl border border-border/70 bg-muted/30 p-3 text-xs text-muted-foreground leading-relaxed flex items-start gap-2">
        <ShieldCheck className="size-4 shrink-0 text-primary mt-0.5" />
        <span>
          Admins can freely switch this wallet to <strong>any blockchain or custom network</strong> at any time. When updated, the customer&apos;s deposit dialog immediately locks to the newly chosen chain.
        </span>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
          className="h-10 rounded-xl text-xs"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={updateMutation.isPending}
          className="bg-primary h-10 rounded-xl text-xs font-bold text-white hover:opacity-95"
        >
          {updateMutation.isPending ? "Saving..." : "Save Network & Addresses"}
        </Button>
      </div>
    </form>
  );
}

export function VaultWalletAddressesModal({
  wallet,
  open,
  onOpenChange,
}: VaultWalletAddressesModalProps) {
  if (!wallet) return null;

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange} desktop="dialog">
      <ResponsiveModalContent className="sm:max-w-xl">
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>Configure Wallet Network & Addresses</ResponsiveModalTitle>
          <ResponsiveModalDescription>
            Choose the designated blockchain network and set receiving addresses for {wallet.name}.
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>

        <AddressesForm key={wallet.id} wallet={wallet} onOpenChange={onOpenChange} />
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
