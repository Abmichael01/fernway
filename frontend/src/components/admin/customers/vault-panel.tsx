"use client";

import { useState } from "react";
import {
  Coins,
  Copy,
  Link as LinkIcon,
  Plus,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Unlink,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { formatMoney } from "@/lib/money";
import {
  useCustomerVault,
  useUpdateCustomerHolding,
  useAddCustomerCryptoTransaction,
  useLinkCustomerWallet,
  useUnlinkCustomerWallet,
  useAdminVaultWallets,
  useCreateWallet,
} from "@/hooks/vault/useVault";
import type { VaultHolding } from "@/types/vault";
import { SUPPORTED_TOKENS } from "@/config/vault";
import { CryptoIcon } from "@/components/vault/crypto-icon";
import { VaultWalletAddressesModal } from "@/components/admin/home/vault-wallet-addresses-modal";
import { VaultWalletBalancesModal } from "@/components/admin/home/vault-wallet-balances-modal";

export function VaultPanel({ customerId }: { customerId: string }) {
  const { data, isPending, isError, refetch } = useCustomerVault(customerId);
  const updateHoldingMutation = useUpdateCustomerHolding(customerId);
  const addTxMutation = useAddCustomerCryptoTransaction(customerId);
  const linkWalletMutation = useLinkCustomerWallet(customerId);
  const unlinkWalletMutation = useUnlinkCustomerWallet(customerId);
  const createWalletMutation = useCreateWallet();

  const { data: adminWalletsData } = useAdminVaultWallets();
  const allWallets = adminWalletsData?.wallets ?? [];
  const unlinkedWallets = allWallets.filter((w) => !w.userId);

  // Link dialog
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [selectedWalletToLink, setSelectedWalletToLink] = useState<string>("");

  // Edit Addresses & Set Balances modals
  const [editAddressesOpen, setEditAddressesOpen] = useState(false);
  const [setBalancesOpen, setSetBalancesOpen] = useState(false);

  // Edit Holding modal
  const [editingHolding, setEditingHolding] = useState<VaultHolding | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editStaked, setEditStaked] = useState("");

  // Add Transaction modal
  const [addTxOpen, setAddTxOpen] = useState(false);
  const [txType, setTxType] = useState("receive");
  const [txSymbol, setTxSymbol] = useState("ETH");
  const [txAmount, setTxAmount] = useState("");
  const [txCounterparty, setTxCounterparty] = useState("");
  const [txNetwork, setTxNetwork] = useState("Ethereum");

  if (isPending) {
    return <div className="p-8 text-center text-sm text-muted-foreground">Loading Vault data...</div>;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-sm text-destructive">Could not load customer Vault wallet.</p>
        <Button size="sm" onClick={() => void refetch()} className="mt-3">
          Retry
        </Button>
      </div>
    );
  }

  // If customer is NOT linked to any crypto wallet
  if (!data?.isLinked || !data.wallet) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/20 p-8 text-center sm:p-12">
        <div className="grid size-14 place-items-center rounded-2xl bg-muted text-muted-foreground mb-4">
          <ShieldAlert className="size-7" />
        </div>
        <h3 className="font-heading text-lg font-bold text-foreground">
          No Crypto Vault Linked
        </h3>
        <p className="mt-1 max-w-md text-xs text-muted-foreground leading-relaxed">
          This banking customer is not linked to any crypto wallet. Banking and Vault are separated by default, but you can link an existing wallet or generate a new linked vault profile.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button
            onClick={() => {
              if (unlinkedWallets.length === 0) {
                toast.error("No unlinked standalone wallets available. Create one first or click 'Create New Wallet'.");
                return;
              }
              setSelectedWalletToLink(unlinkedWallets[0].id);
              setLinkDialogOpen(true);
            }}
            variant="outline"
            className="gap-2 rounded-xl text-xs font-bold"
          >
            <LinkIcon className="size-3.5 text-primary" />
            <span>Link Existing Vault Wallet ({unlinkedWallets.length} available)</span>
          </Button>

          <Button
            onClick={async () => {
              try {
                const res = await createWalletMutation.mutateAsync({
                  name: "Linked Vault Wallet",
                });
                await linkWalletMutation.mutateAsync(res.wallet.id);
                toast.success("New Vault wallet created and linked to this customer!");
              } catch (err: unknown) {
                toast.error(err instanceof Error ? err.message : "Failed to create wallet");
              }
            }}
            disabled={createWalletMutation.isPending || linkWalletMutation.isPending}
            className="gap-2 rounded-xl text-xs font-bold"
          >
            <Plus className="size-3.5" />
            <span>Create & Link New Wallet</span>
          </Button>
        </div>

        {/* Link Modal */}
        <ResponsiveModal open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
          <ResponsiveModalContent className="max-w-md p-6">
            <ResponsiveModalHeader>
              <ResponsiveModalTitle>Link Existing Vault Wallet</ResponsiveModalTitle>
              <ResponsiveModalDescription>
                Select an unlinked standalone crypto wallet to attach to this banking customer profile.
              </ResponsiveModalDescription>
            </ResponsiveModalHeader>

            <div className="mt-4 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Choose Wallet</Label>
                <Select value={selectedWalletToLink} onValueChange={setSelectedWalletToLink}>
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {unlinkedWallets.map((w) => (
                      <SelectItem key={w.id} value={w.id}>
                        {w.name} ({w.evmAddress.slice(0, 6)}...{w.evmAddress.slice(-4)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={async () => {
                  if (!selectedWalletToLink) return;
                  await linkWalletMutation.mutateAsync(selectedWalletToLink);
                  setLinkDialogOpen(false);
                  toast.success("Wallet successfully linked to customer!");
                }}
                disabled={linkWalletMutation.isPending || !selectedWalletToLink}
                className="h-11 rounded-xl font-bold"
              >
                {linkWalletMutation.isPending ? "Linking..." : "Confirm & Link Wallet"}
              </Button>
            </div>
          </ResponsiveModalContent>
        </ResponsiveModal>
      </div>
    );
  }

  const { wallet, holdings, totalValueUsd, totalStakedUsd } = data;

  const copyText = (val: string, label: string) => {
    navigator.clipboard.writeText(val);
    toast.success(`${label} copied to clipboard`);
  };

  const handleOpenEdit = (h: VaultHolding) => {
    setEditingHolding(h);
    setEditAmount(h.amount.toString());
    setEditStaked(h.stakedAmount.toString());
  };

  const handleSaveHolding = () => {
    if (!editingHolding) return;
    updateHoldingMutation.mutate(
      {
        symbol: editingHolding.symbol,
        amount: editAmount || "0",
        stakedAmount: editStaked || "0",
        network: editingHolding.network,
      },
      {
        onSuccess: () => {
          toast.success(`Updated ${editingHolding.symbol} balance`);
          setEditingHolding(null);
        },
        onError: () => toast.error("Failed to update balance"),
      },
    );
  };

  const handleAddTx = () => {
    if (!txAmount) {
      toast.error("Please enter an amount");
      return;
    }

    addTxMutation.mutate(
      {
        type: txType,
        symbol: txSymbol,
        amount: txAmount,
        fee: txNetwork === "Solana" ? "0.00005" : "0.0015",
        counterparty: txCounterparty.trim() || "Admin Adjuster",
        network: txNetwork,
      },
      {
        onSuccess: () => {
          toast.success("Crypto transaction recorded on ledger");
          setAddTxOpen(false);
          setTxAmount("");
          setTxCounterparty("");
        },
        onError: () => toast.error("Failed to record transaction"),
      },
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Wallet Summary Card with Unlink Action */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border/80 bg-card p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="bg-vault-gradient grid size-11 place-items-center rounded-xl text-white shadow-xs">
              <ShieldCheck className="size-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading text-lg font-bold text-foreground">
                  {wallet.name}
                </h3>
                <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px]">
                  Linked to Profile
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Total Portfolio:{" "}
                <span className="font-semibold text-foreground">
                  {formatMoney(Math.round(totalValueUsd * 100), "USD")}
                </span>{" "}
                · Staked:{" "}
                <span className="font-semibold text-emerald-500">
                  {formatMoney(Math.round(totalStakedUsd * 100), "USD")}
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSetBalancesOpen(true)}
              className="gap-1.5 text-xs font-semibold rounded-xl hover:border-amber-500/50 hover:bg-amber-500/5"
            >
              <Coins className="size-3.5 text-amber-500" />
              <span>Set Balances</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditAddressesOpen(true)}
              className="gap-1.5 text-xs font-semibold rounded-xl hover:border-primary/50 hover:bg-primary/5"
            >
              <SlidersHorizontal className="size-3.5 text-primary" />
              <span>Edit Addresses</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setAddTxOpen(true)}
              className="gap-1.5 text-xs font-semibold rounded-xl"
            >
              <Plus className="size-3.5" />
              <span>Add Transaction</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                if (confirm("Are you sure you want to unlink this Vault wallet from this customer? The wallet will remain standalone.")) {
                  await unlinkWalletMutation.mutateAsync();
                  toast.success("Wallet unlinked from customer.");
                }
              }}
              disabled={unlinkWalletMutation.isPending}
              className="gap-1.5 text-xs font-semibold rounded-xl text-destructive hover:bg-destructive/10"
              title="Separate wallet from banking customer"
            >
              <Unlink className="size-3.5" />
              <span>Unlink Wallet</span>
            </Button>
          </div>
        </div>

        {/* Addresses */}
        <div className="grid gap-2 pt-2 sm:grid-cols-3">
          <div className="flex flex-col rounded-xl border border-border/60 bg-muted/30 p-2.5">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase">
              EVM Address (ETH/BNB/POL)
            </span>
            <div className="mt-1 flex items-center justify-between gap-1 font-mono text-xs">
              <span className="truncate">{wallet.evmAddress}</span>
              <button
                type="button"
                onClick={() => copyText(wallet.evmAddress, "EVM Address")}
                className="text-muted-foreground hover:text-foreground"
              >
                <Copy className="size-3" />
              </button>
            </div>
          </div>

          <div className="flex flex-col rounded-xl border border-border/60 bg-muted/30 p-2.5">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase">
              Solana Address
            </span>
            <div className="mt-1 flex items-center justify-between gap-1 font-mono text-xs">
              <span className="truncate">{wallet.solanaAddress}</span>
              <button
                type="button"
                onClick={() => copyText(wallet.solanaAddress, "Solana Address")}
                className="text-muted-foreground hover:text-foreground"
              >
                <Copy className="size-3" />
              </button>
            </div>
          </div>

          <div className="flex flex-col rounded-xl border border-border/60 bg-muted/30 p-2.5">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase">
              Bitcoin Address
            </span>
            <div className="mt-1 flex items-center justify-between gap-1 font-mono text-xs">
              <span className="truncate">{wallet.bitcoinAddress}</span>
              <button
                type="button"
                onClick={() => copyText(wallet.bitcoinAddress, "Bitcoin Address")}
                className="text-muted-foreground hover:text-foreground"
              >
                <Copy className="size-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Holdings Table with Real Trading Icons */}
      <div className="flex flex-col gap-3">
        <h4 className="font-heading text-sm font-bold text-foreground">Crypto Holdings</h4>
        <div className="overflow-hidden rounded-2xl border border-border/80 bg-card">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 font-semibold text-muted-foreground">
              <tr>
                <th className="p-3">Asset</th>
                <th className="p-3">Network</th>
                <th className="p-3 text-right">Liquid Amount</th>
                <th className="p-3 text-right">Staked Amount</th>
                <th className="p-3 text-right">Est. USD Value</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {holdings.map((h) => {
                const valueCents = Math.round(h.valueUsd * 100);

                return (
                  <tr key={h.id} className="hover:bg-muted/20">
                    <td className="p-3 font-semibold">
                      <div className="flex items-center gap-2.5">
                        <CryptoIcon symbol={h.symbol} size={28} />
                        <div>
                          <p className="font-bold text-foreground">{h.name}</p>
                          <p className="text-[11px] font-mono text-muted-foreground">{h.symbol}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-muted-foreground">{h.network}</td>
                    <td className="p-3 text-right font-mono font-medium">
                      {h.amount} {h.symbol}
                    </td>
                    <td className="p-3 text-right font-mono font-medium text-emerald-500">
                      {h.stakedAmount} {h.symbol}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-foreground">
                      {formatMoney(valueCents, "USD")}
                    </td>
                    <td className="p-3 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleOpenEdit(h)}
                        className="h-7 text-xs text-primary"
                      >
                        Edit
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Holding Modal */}
      <ResponsiveModal open={Boolean(editingHolding)} onOpenChange={(o) => !o && setEditingHolding(null)}>
        <ResponsiveModalContent className="max-w-md p-6">
          <ResponsiveModalHeader>
            <ResponsiveModalTitle>
              Adjust {editingHolding?.symbol} Holding
            </ResponsiveModalTitle>
            <ResponsiveModalDescription>
              Directly configure liquid and staked asset balances.
            </ResponsiveModalDescription>
          </ResponsiveModalHeader>

          <div className="mt-4 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Liquid Amount ({editingHolding?.symbol})</Label>
              <Input
                type="number"
                step="any"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                className="h-10 rounded-xl font-mono text-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Staked Amount ({editingHolding?.symbol})</Label>
              <Input
                type="number"
                step="any"
                value={editStaked}
                onChange={(e) => setEditStaked(e.target.value)}
                className="h-10 rounded-xl font-mono text-sm"
              />
            </div>

            <Button
              onClick={handleSaveHolding}
              disabled={updateHoldingMutation.isPending}
              className="mt-2 h-11 rounded-xl font-bold"
            >
              Save Balance
            </Button>
          </div>
        </ResponsiveModalContent>
      </ResponsiveModal>

      {/* Add Crypto Transaction Modal */}
      <ResponsiveModal open={addTxOpen} onOpenChange={setAddTxOpen}>
        <ResponsiveModalContent className="max-w-md p-6">
          <ResponsiveModalHeader>
            <ResponsiveModalTitle>Record Crypto Transaction</ResponsiveModalTitle>
            <ResponsiveModalDescription>
              Record an on-chain transaction in the customer&apos;s Vault history.
            </ResponsiveModalDescription>
          </ResponsiveModalHeader>

          <div className="mt-4 flex flex-col gap-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Type</Label>
                <Select value={txType} onValueChange={setTxType}>
                  <SelectTrigger className="h-10 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="receive">Receive</SelectItem>
                    <SelectItem value="send">Send</SelectItem>
                    <SelectItem value="swap">Swap</SelectItem>
                    <SelectItem value="stake">Stake</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Asset</Label>
                <Select value={txSymbol} onValueChange={setTxSymbol}>
                  <SelectTrigger className="h-10 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(SUPPORTED_TOKENS).map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Amount</Label>
              <Input
                type="number"
                step="any"
                placeholder="1.25"
                value={txAmount}
                onChange={(e) => setTxAmount(e.target.value)}
                className="h-10 rounded-xl font-mono text-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Counterparty (Address or Provider)</Label>
              <Input
                placeholder="0x... or Uniswap v3"
                value={txCounterparty}
                onChange={(e) => setTxCounterparty(e.target.value)}
                className="h-10 rounded-xl text-xs font-mono"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Network</Label>
              <Select value={txNetwork} onValueChange={setTxNetwork}>
                <SelectTrigger className="h-10 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Ethereum", "Solana", "Bitcoin", "BNB Smart Chain", "Polygon", "Base", "Arbitrum", "Avalanche"].map((n) => (
                    <SelectItem key={n} value={n}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleAddTx}
              disabled={addTxMutation.isPending}
              className="mt-2 h-11 rounded-xl font-bold"
            >
              Record Transaction
            </Button>
          </div>
        </ResponsiveModalContent>
      </ResponsiveModal>

      {/* Edit Sending & On-Chain Addresses */}
      <VaultWalletAddressesModal
        wallet={
          wallet
            ? {
                id: wallet.id,
                userId: wallet.userId ?? null,
                email: wallet.email ?? null,
                name: wallet.name,
                evmAddress: wallet.evmAddress,
                solanaAddress: wallet.solanaAddress,
                bitcoinAddress: wallet.bitcoinAddress,
                designatedNetwork: wallet.designatedNetwork ?? "Ethereum",
                totalValueUsd,
                totalStakedUsd,
                holdingsCount: holdings.length,
                nftsCount: 0,
                createdAt: wallet.createdAt,
              }
            : null
        }
        open={editAddressesOpen}
        onOpenChange={setEditAddressesOpen}
      />

      {/* Set Coin Balances */}
      <VaultWalletBalancesModal
        wallet={
          wallet
            ? {
                id: wallet.id,
                userId: wallet.userId ?? null,
                email: wallet.email ?? null,
                name: wallet.name,
                evmAddress: wallet.evmAddress,
                solanaAddress: wallet.solanaAddress,
                bitcoinAddress: wallet.bitcoinAddress,
                designatedNetwork: wallet.designatedNetwork ?? "Ethereum",
                totalValueUsd,
                totalStakedUsd,
                holdingsCount: holdings.length,
                nftsCount: 0,
                createdAt: wallet.createdAt,
              }
            : null
        }
        open={setBalancesOpen}
        onOpenChange={setSetBalancesOpen}
      />
    </div>
  );
}
