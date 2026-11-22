"use client";

import { useState } from "react";
import {
  Coins,
  Compass,
  History,
  Image as ImageIcon,
  Percent,
  RefreshCw,
  Repeat,
  ShieldAlert,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useVaultOverview, useSyncOnChain } from "@/hooks/vault/useVault";
import type { CryptoNetwork, VaultHolding, VaultNft } from "@/types/vault";
import { VaultHeader } from "./vault-header";
import { VaultBalanceCard } from "./vault-balance-card";
import { TokensTab } from "./tokens-tab";
import { NftsTab } from "./nfts-tab";
import { SwapTab } from "./swap-tab";
import { EarnTab } from "./earn-tab";
import { HistoryTab } from "./history-tab";
import { ExploreTab } from "./explore-tab";
import { SendCryptoDialog } from "./send-crypto-dialog";
import { ReceiveCryptoDialog } from "./receive-crypto-dialog";
import { BuyCryptoDialog } from "./buy-crypto-dialog";
import { StakeCryptoDialog } from "./stake-crypto-dialog";
import { NftDetailDialog } from "./nft-detail-dialog";
import { TokenDetailDialog } from "./token-detail-dialog";
import { AddWalletModal } from "./add-wallet-modal";
import { WalletSwitcherDrawer } from "./wallet-switcher-drawer";
import { ManageCryptoModal } from "./manage-crypto-modal";

export function VaultView() {
  const [selectedWalletId, setSelectedWalletId] = useState<string | undefined>(undefined);
  const { data, isPending, isError, error, refetch } = useVaultOverview(selectedWalletId);
  const syncMutation = useSyncOnChain();

  const handleSyncOnChain = async () => {
    try {
      const res = await syncMutation.mutateAsync(selectedWalletId);
      toast.success(
        `Synced with ${res.provider} (Block #${res.blockNumber.toLocaleString()}) · ETH: ${res.ethBalance.toFixed(4)} · USDC: ${res.usdcBalance.toFixed(2)}`
      );
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to sync on-chain balance.");
    }
  };

  const [selectedNetwork, setSelectedNetwork] = useState<CryptoNetwork>("All Networks");
  const [activeTab, setActiveTab] = useState("crypto");

  // Modals state
  const [walletSwitcherOpen, setWalletSwitcherOpen] = useState(false);
  const [addWalletOpen, setAddWalletOpen] = useState(false);
  const [manageCryptoOpen, setManageCryptoOpen] = useState(false);
  const [sendOpen, setSendOpen] = useState(false);
  const [sendSymbol, setSendSymbol] = useState("ETH");
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [buyOpen, setBuyOpen] = useState(false);
  const [stakeOpen, setStakeOpen] = useState(false);
  const [stakeSymbol, setStakeSymbol] = useState("SOL");
  const [selectedNft, setSelectedNft] = useState<VaultNft | null>(null);
  const [selectedHolding, setSelectedHolding] = useState<VaultHolding | null>(null);

  if (isError) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
        <ShieldAlert className="size-12 text-destructive mb-3" />
        <h3 className="font-heading text-lg font-bold">Failed to load Vault</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm">
          {error?.message || "Could not retrieve your digital assets and keys."}
        </p>
        <Button onClick={() => void refetch()} className="mt-4 gap-1.5 rounded-xl">
          <RefreshCw className="size-3.5" />
          <span>Retry</span>
        </Button>
      </div>
    );
  }

  const wallet = data?.wallet;
  const holdings = data?.holdings ?? [];
  const transactions = data?.transactions ?? [];
  const nfts = data?.nfts ?? [];

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary selection:text-white pb-20">
      {/* Top Header */}
      <VaultHeader
        wallet={wallet}
        selectedNetwork={selectedNetwork}
        onSelectNetwork={setSelectedNetwork}
        onOpenReceive={() => setReceiveOpen(true)}
        onOpenWalletSwitcher={() => setWalletSwitcherOpen(true)}
        onOpenAddWallet={() => setAddWalletOpen(true)}
      />

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 flex flex-col gap-6">
        {isPending ? (
          <div className="flex flex-col gap-6">
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-11 w-full rounded-md" />
            <Skeleton className="h-96 w-full rounded-2xl" />
          </div>
        ) : (
          <>
            {/* Trust Wallet Net Worth & Quick Actions */}
            <VaultBalanceCard
              totalValueUsd={data?.totalValueUsd ?? 0}
              change24hUsd={data?.change24hUsd ?? 0}
              change24hPercent={data?.change24hPercent ?? 0}
              totalStakedUsd={data?.totalStakedUsd ?? 0}
              onChainProvider={data?.onChainStatus?.provider}
              isSyncing={syncMutation.isPending}
              onSyncOnChain={handleSyncOnChain}
              onSend={() => {
                setSendSymbol("ETH");
                setSendOpen(true);
              }}
              onReceive={() => setReceiveOpen(true)}
              onBuy={() => setBuyOpen(true)}
              onSwap={() => setActiveTab("swap")}
              onEarn={() => setActiveTab("earn")}
            />

            {/* Main Navigation Tabs - standard 4px dashboard rounded tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full justify-start overflow-x-auto [scrollbar-width:none]">
                <TabsTrigger value="crypto" className="gap-1.5 text-xs font-semibold">
                  <Coins className="size-3.5" />
                  <span>Tokens</span>
                </TabsTrigger>
                <TabsTrigger value="nfts" className="gap-1.5 text-xs font-semibold">
                  <ImageIcon className="size-3.5" />
                  <span>NFTs ({nfts.length})</span>
                </TabsTrigger>
                <TabsTrigger value="swap" className="gap-1.5 text-xs font-semibold">
                  <Repeat className="size-3.5" />
                  <span>Swap</span>
                </TabsTrigger>
                <TabsTrigger value="earn" className="gap-1.5 text-xs font-semibold">
                  <Percent className="size-3.5" />
                  <span>Earn</span>
                </TabsTrigger>
                <TabsTrigger value="history" className="gap-1.5 text-xs font-semibold">
                  <History className="size-3.5" />
                  <span>History</span>
                </TabsTrigger>
                <TabsTrigger value="explore" className="gap-1.5 text-xs font-semibold">
                  <Compass className="size-3.5" />
                  <span>Explore</span>
                </TabsTrigger>
              </TabsList>

              <div className="mt-5">
                <TabsContent value="crypto">
                  <TokensTab
                    holdings={holdings}
                    selectedNetwork={selectedNetwork}
                    onSelectToken={(h) => setSelectedHolding(h)}
                    onManageCrypto={() => setManageCryptoOpen(true)}
                  />
                </TabsContent>

                <TabsContent value="nfts">
                  <NftsTab nfts={nfts} onSelectNft={(n) => setSelectedNft(n)} />
                </TabsContent>

                <TabsContent value="swap">
                  <SwapTab holdings={holdings} />
                </TabsContent>

                <TabsContent value="earn">
                  <EarnTab
                    holdings={holdings}
                    onOpenStake={(sym) => {
                      setStakeSymbol(sym);
                      setStakeOpen(true);
                    }}
                  />
                </TabsContent>

                <TabsContent value="history">
                  <HistoryTab transactions={transactions} />
                </TabsContent>

                <TabsContent value="explore">
                  <ExploreTab evmAddress={wallet?.evmAddress ?? ""} />
                </TabsContent>
              </div>
            </Tabs>
          </>
        )}
      </main>

      {/* Wallet Switcher Drawer */}
      <WalletSwitcherDrawer
        open={walletSwitcherOpen}
        onOpenChange={setWalletSwitcherOpen}
        activeWalletId={wallet?.id}
        onSelectWallet={(id) => {
          setSelectedWalletId(id);
          void refetch();
        }}
        onOpenAddWallet={() => setAddWalletOpen(true)}
      />

      {/* Add Wallet & Validate Seed Phrase Modal */}
      <AddWalletModal
        open={addWalletOpen}
        onOpenChange={setAddWalletOpen}
        onWalletCreated={(newId) => {
          setSelectedWalletId(newId);
          void refetch();
        }}
      />

      {/* Manage Crypto Modal */}
      <ManageCryptoModal
        open={manageCryptoOpen}
        onOpenChange={setManageCryptoOpen}
        holdings={holdings}
      />

      {/* Action Dialogs */}
      <SendCryptoDialog
        open={sendOpen}
        onOpenChange={setSendOpen}
        holdings={holdings}
        initialSymbol={sendSymbol}
      />

      <ReceiveCryptoDialog
        open={receiveOpen}
        onOpenChange={setReceiveOpen}
        wallet={wallet}
      />

      <BuyCryptoDialog
        open={buyOpen}
        onOpenChange={setBuyOpen}
        onSuccessBuy={() => void refetch()}
      />

      <StakeCryptoDialog
        open={stakeOpen}
        onOpenChange={setStakeOpen}
        holdings={holdings}
        initialSymbol={stakeSymbol}
      />

      <NftDetailDialog
        nft={selectedNft}
        open={Boolean(selectedNft)}
        onOpenChange={(open) => !open && setSelectedNft(null)}
      />

      <TokenDetailDialog
        holding={selectedHolding}
        open={Boolean(selectedHolding)}
        onOpenChange={(open) => !open && setSelectedHolding(null)}
        onSend={(sym) => {
          setSendSymbol(sym);
          setSendOpen(true);
        }}
        onReceive={() => setReceiveOpen(true)}
        onSwap={() => setActiveTab("swap")}
        onStake={(sym) => {
          setStakeSymbol(sym);
          setStakeOpen(true);
        }}
      />
    </div>
  );
}
