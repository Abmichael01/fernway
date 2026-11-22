"use client";

import { useMemo, useState } from "react";
import {
  Coins,
  Copy,
  Globe,
  Link as LinkIcon,
  RefreshCw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Unlink,
  UserPlus,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatMoney } from "@/lib/money";
import {
  useAdminVaultWallets,
  useAdminCreateStandaloneWallet,
  useAdminLinkWallet,
  useAdminUnlinkWallet,
} from "@/hooks/vault/useVault";
import { useCustomers } from "@/hooks/admin/useAdminCustomers";
import type { AdminVaultWalletItem } from "@/types/vault";
import { VaultWalletAddressesModal } from "./vault-wallet-addresses-modal";
import { VaultWalletBalancesModal } from "./vault-wallet-balances-modal";

export function VaultWalletsView() {
  const { data, isPending, refetch } = useAdminVaultWallets();
  const { data: bankingCustomers } = useCustomers();
  const createWalletMutation = useAdminCreateStandaloneWallet();
  const linkWalletMutation = useAdminLinkWallet();
  const unlinkWalletMutation = useAdminUnlinkWallet();

  const [search, setSearch] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newWalletName, setNewWalletName] = useState("");
  const [newWalletEmail, setNewWalletEmail] = useState("");

  // Link dialog
  const [linkingWallet, setLinkingWallet] = useState<AdminVaultWalletItem | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");

  // Edit addresses modal
  const [addressesWallet, setAddressesWallet] = useState<AdminVaultWalletItem | null>(null);

  // Set balances modal
  const [balancesWallet, setBalancesWallet] = useState<AdminVaultWalletItem | null>(null);

  const wallets = useMemo(() => data?.wallets ?? [], [data?.wallets]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return wallets;
    return wallets.filter(
      (w) =>
        w.name.toLowerCase().includes(term) ||
        (w.email && w.email.toLowerCase().includes(term)) ||
        w.evmAddress.toLowerCase().includes(term) ||
        (w.linkedCustomer &&
          `${w.linkedCustomer.firstName} ${w.linkedCustomer.lastName} ${w.linkedCustomer.email}`
            .toLowerCase()
            .includes(term)),
    );
  }, [wallets, search]);

  const copyText = (val: string, label: string) => {
    navigator.clipboard.writeText(val);
    toast.success(`${label} copied to clipboard`);
  };

  const totalAumUsd = wallets.reduce((sum, w) => sum + w.totalValueUsd, 0);
  const totalStakedUsd = wallets.reduce((sum, w) => sum + w.totalStakedUsd, 0);
  const standaloneCount = wallets.filter((w) => !w.userId).length;
  const linkedCount = wallets.filter((w) => Boolean(w.userId)).length;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWalletName.trim()) {
      toast.error("Please enter a wallet name.");
      return;
    }

    try {
      await createWalletMutation.mutateAsync({
        name: newWalletName.trim(),
        email: newWalletEmail.trim() || undefined,
      });
      toast.success(`Standalone Vault user "${newWalletName}" created with seed assets!`);
      setCreateDialogOpen(false);
      setNewWalletName("");
      setNewWalletEmail("");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create wallet");
    }
  };

  const handleLink = async () => {
    if (!linkingWallet || !selectedCustomerId) return;
    try {
      await linkWalletMutation.mutateAsync({
        walletId: linkingWallet.id,
        customerId: selectedCustomerId,
      });
      toast.success("Wallet successfully linked to banking customer!");
      setLinkingWallet(null);
      setSelectedCustomerId("");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to link wallet");
    }
  };

  const handleUnlink = async (walletId: string) => {
    if (confirm("Are you sure you want to unlink this wallet? It will become a standalone vault user.")) {
      try {
        await unlinkWalletMutation.mutateAsync(walletId);
        toast.success("Wallet unlinked. It is now a standalone Vault user.");
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to unlink wallet");
      }
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Action & Subheading */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-lg font-bold text-foreground">
            Vault Crypto Users & Wallets
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Vault users are separated from banking by default. Link any wallet to share customer profile details.
          </p>
        </div>

        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="gap-2 rounded-xl font-bold text-xs"
        >
          <UserPlus className="size-4" />
          <span>New Standalone Vault User</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase">
            <Wallet className="size-4 text-primary" />
            <span>Vault Wallets</span>
          </div>
          <p className="mt-2 text-2xl font-bold font-heading text-foreground">
            {wallets.length}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {standaloneCount} standalone · {linkedCount} linked to banking
          </p>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase">
            <Coins className="size-4 text-primary" />
            <span>Total Crypto AUM</span>
          </div>
          <p className="mt-2 text-2xl font-bold font-heading text-foreground">
            {formatMoney(Math.round(totalAumUsd * 100), "USD")}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Across BTC, ETH, SOL, BNB & stables
          </p>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase">
            <Sparkles className="size-4 text-emerald-500" />
            <span>Staked Protocol Yield</span>
          </div>
          <p className="mt-2 text-2xl font-bold font-heading text-emerald-500">
            {formatMoney(Math.round(totalStakedUsd * 100), "USD")}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Active liquid staking across validators
          </p>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase">
            <Globe className="size-4 text-primary" />
            <span>Supported Chains</span>
          </div>
          <p className="mt-2 text-2xl font-bold font-heading text-foreground">
            8 Chains
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Ethereum, Solana, Bitcoin, BNB, Polygon, Base
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search wallet, email, address, or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 rounded-xl bg-card pl-9 text-xs"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void refetch()}
          className="h-10 gap-1.5 rounded-xl text-xs"
        >
          <RefreshCw className="size-3.5" />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Wallets Table */}
      <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="text-xs">Wallet & User</TableHead>
              <TableHead className="text-xs">Multi-Chain Addresses</TableHead>
              <TableHead className="text-xs text-right">Portfolio Value</TableHead>
              <TableHead className="text-xs text-right">Staked Value</TableHead>
              <TableHead className="text-xs">Banking Customer Link</TableHead>
              <TableHead className="text-xs text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending ? (
              <TableRow>
                <TableCell colSpan={6} className="h-28 text-center text-xs text-muted-foreground">
                  Loading Vault users and wallets...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-28 text-center text-xs text-muted-foreground">
                  No Vault wallets found matching your search.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((w) => {
                const shortEvm = `${w.evmAddress.slice(0, 6)}...${w.evmAddress.slice(-4)}`;
                const shortSol = `${w.solanaAddress.slice(0, 6)}...${w.solanaAddress.slice(-4)}`;

                return (
                  <TableRow key={w.id} className="hover:bg-muted/20">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <span className="bg-vault-gradient grid size-9 shrink-0 place-items-center rounded-xl text-white shadow-xs">
                          <ShieldCheck className="size-4.5" />
                        </span>
                        <div>
                          <p className="font-heading font-bold text-foreground">{w.name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[11px] text-muted-foreground">
                              {w.email || "Standalone Crypto User"}
                            </span>
                            <Badge
                              variant="outline"
                              className="h-4 px-1 text-[9px] font-semibold text-primary border-primary/30 bg-primary/5"
                            >
                              {w.designatedNetwork || "Ethereum"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col gap-1 font-mono text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <span className="text-muted-foreground w-7">EVM:</span>
                          <span>{shortEvm}</span>
                          <button
                            type="button"
                            onClick={() => copyText(w.evmAddress, "EVM Address")}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Copy className="size-3" />
                          </button>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-muted-foreground w-7">SOL:</span>
                          <span>{shortSol}</span>
                          <button
                            type="button"
                            onClick={() => copyText(w.solanaAddress, "Solana Address")}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Copy className="size-3" />
                          </button>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-right font-mono font-bold text-foreground">
                      {formatMoney(Math.round(w.totalValueUsd * 100), "USD")}
                      <p className="text-[10px] text-muted-foreground font-sans font-normal">
                        {w.holdingsCount} tokens · {w.nftsCount} NFTs
                      </p>
                    </TableCell>

                    <TableCell className="text-right font-mono font-bold text-emerald-500">
                      {formatMoney(Math.round(w.totalStakedUsd * 100), "USD")}
                    </TableCell>

                    <TableCell>
                      {w.linkedCustomer ? (
                        <div className="flex flex-col">
                          <Badge
                            variant="outline"
                            className="w-fit border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold"
                          >
                            Linked
                          </Badge>
                          <span className="font-semibold text-xs text-foreground mt-0.5">
                            {w.linkedCustomer.firstName} {w.linkedCustomer.lastName}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {w.linkedCustomer.email}
                          </span>
                        </div>
                      ) : (
                        <Badge
                          variant="outline"
                          className="border-border text-muted-foreground text-[10px] font-semibold"
                        >
                          Standalone / Unlinked
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setBalancesWallet(w)}
                          className="h-8 gap-1.5 rounded-xl text-xs font-semibold hover:border-amber-500/50 hover:bg-amber-500/5"
                          title="Set balances & liquid staking for any coin"
                        >
                          <Coins className="size-3.5 text-amber-500" />
                          <span className="hidden sm:inline">Set Balances</span>
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setAddressesWallet(w)}
                          className="h-8 gap-1.5 rounded-xl text-xs font-semibold hover:border-primary/50 hover:bg-primary/5"
                          title="Edit sending & deposit addresses"
                        >
                          <SlidersHorizontal className="size-3.5 text-primary" />
                          <span className="hidden sm:inline">Edit Addresses</span>
                        </Button>

                        {w.linkedCustomer ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUnlink(w.id)}
                            disabled={unlinkWalletMutation.isPending}
                            className="h-8 gap-1.5 rounded-xl text-xs text-destructive hover:bg-destructive/10"
                            title="Unlink from banking customer"
                          >
                            <Unlink className="size-3.5" />
                            <span className="hidden sm:inline">Unlink</span>
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setLinkingWallet(w);
                              if (bankingCustomers && bankingCustomers.length > 0) {
                                setSelectedCustomerId(bankingCustomers[0].id);
                              }
                            }}
                            className="h-8 gap-1.5 rounded-xl text-xs font-semibold text-primary"
                            title="Link to banking customer"
                          >
                            <LinkIcon className="size-3.5" />
                            <span className="hidden sm:inline">Link</span>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create Standalone Wallet Modal */}
      <ResponsiveModal open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <ResponsiveModalContent className="max-w-md p-6">
          <ResponsiveModalHeader>
            <ResponsiveModalTitle>Create Standalone Vault User</ResponsiveModalTitle>
            <ResponsiveModalDescription>
              Create an independent crypto wallet not tied to any banking account. You can link it later at any time.
            </ResponsiveModalDescription>
          </ResponsiveModalHeader>

          <form onSubmit={handleCreate} className="mt-4 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">User / Wallet Name</Label>
              <Input
                value={newWalletName}
                onChange={(e) => setNewWalletName(e.target.value)}
                placeholder="e.g. Satoshi Nakamoto or DeFi Trading"
                className="h-10 rounded-xl"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Email (Optional)</Label>
              <Input
                type="email"
                value={newWalletEmail}
                onChange={(e) => setNewWalletEmail(e.target.value)}
                placeholder="e.g. satoshi@vault.dev"
                className="h-10 rounded-xl"
              />
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/30 p-3 text-xs text-muted-foreground leading-relaxed">
              Auto-generates multi-chain addresses (EVM, Solana, Bitcoin) and provisions initial tokens and digital assets for immediate activation.
            </div>

            <Button
              type="submit"
              disabled={createWalletMutation.isPending || !newWalletName.trim()}
              className="mt-2 h-11 rounded-xl font-bold"
            >
              {createWalletMutation.isPending ? "Creating..." : "Create Standalone User"}
            </Button>
          </form>
        </ResponsiveModalContent>
      </ResponsiveModal>

      {/* Link Wallet to Banking Customer Modal */}
      <ResponsiveModal
        open={Boolean(linkingWallet)}
        onOpenChange={(open) => !open && setLinkingWallet(null)}
      >
        <ResponsiveModalContent className="max-w-md p-6">
          <ResponsiveModalHeader>
            <ResponsiveModalTitle>Link Vault Wallet to Banking Customer</ResponsiveModalTitle>
            <ResponsiveModalDescription>
              Connect &quot;{linkingWallet?.name}&quot; to a banking customer so they share a unified profile.
            </ResponsiveModalDescription>
          </ResponsiveModalHeader>

          <div className="mt-4 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Select Banking Customer</Label>
              <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder="Choose a banking customer..." />
                </SelectTrigger>
                <SelectContent>
                  {bankingCustomers?.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.firstName} {c.lastName} ({c.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleLink}
              disabled={linkWalletMutation.isPending || !selectedCustomerId}
              className="mt-2 h-11 rounded-xl font-bold"
            >
              {linkWalletMutation.isPending ? "Linking..." : "Confirm & Link Profile"}
            </Button>
          </div>
        </ResponsiveModalContent>
      </ResponsiveModal>

      {/* Edit Sending & On-Chain Addresses Modal */}
      <VaultWalletAddressesModal
        wallet={addressesWallet}
        open={Boolean(addressesWallet)}
        onOpenChange={(open) => !open && setAddressesWallet(null)}
      />

      {/* Set Coin Balances & Staking Modal */}
      <VaultWalletBalancesModal
        wallet={balancesWallet}
        open={Boolean(balancesWallet)}
        onOpenChange={(open) => !open && setBalancesWallet(null)}
      />
    </div>
  );
}
