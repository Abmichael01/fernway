"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Check,
  ChevronDown,
  Copy,
  Globe,
  Layers,
  LogOut,
  Moon,
  Plus,
  QrCode,
  ShieldCheck,
  Sun,
  Wallet,
} from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { CryptoNetwork, VaultWallet } from "@/types/vault";
import { useSignOut } from "@/hooks/auth/useSignOut";
import { useRouter } from "next/navigation";
import { CryptoIcon } from "./crypto-icon";

const NETWORKS: { id: CryptoNetwork; label: string; symbol: string }[] = [
  { id: "All Networks", label: "All Networks", symbol: "ALL" },
  { id: "Ethereum", label: "Ethereum", symbol: "ETH" },
  { id: "Solana", label: "Solana", symbol: "SOL" },
  { id: "Bitcoin", label: "Bitcoin", symbol: "BTC" },
  { id: "BNB Smart Chain", label: "BNB Chain", symbol: "BNB" },
  { id: "Polygon", label: "Polygon", symbol: "POL" },
  { id: "Arbitrum", label: "Arbitrum", symbol: "ARB" },
  { id: "Base", label: "Base", symbol: "BASE" },
  { id: "Avalanche", label: "Avalanche", symbol: "AVAX" },
];

interface VaultHeaderProps {
  wallet: VaultWallet | undefined | null;
  selectedNetwork: CryptoNetwork;
  onSelectNetwork: (network: CryptoNetwork) => void;
  onOpenReceive: () => void;
  onOpenWalletSwitcher: () => void;
  onOpenAddWallet: () => void;
}

export function VaultHeader({
  wallet,
  selectedNetwork,
  onSelectNetwork,
  onOpenReceive,
  onOpenWalletSwitcher,
  onOpenAddWallet,
}: VaultHeaderProps) {
  const { theme, setTheme } = useTheme();
  const signOut = useSignOut();
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const activeNetwork = NETWORKS.find((n) => n.id === selectedNetwork) ?? NETWORKS[0];
  const designatedNetwork = wallet?.designatedNetwork || "Ethereum";
  const activeAddress =
    designatedNetwork === "Solana"
      ? wallet?.solanaAddress ?? wallet?.evmAddress ?? ""
      : designatedNetwork === "Bitcoin"
      ? wallet?.bitcoinAddress ?? wallet?.evmAddress ?? ""
      : wallet?.evmAddress ?? "0x71C8409391E606cD20689eB4D8D2513f5c8893B9";
  const shortAddress =
    activeAddress.length > 10
      ? `${activeAddress.slice(0, 6)}...${activeAddress.slice(-4)}`
      : activeAddress;

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(activeAddress);
      setCopied(true);
      toast.success(`${designatedNetwork} address copied to clipboard`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy address");
    }
  };

  const handleSignOut = () => {
    signOut.mutate(undefined, {
      onSuccess: () => router.push("/vault/sign-in"),
    });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        {/* Brand & Wallet Switcher Trigger */}
        <div className="flex items-center gap-3">
          <Link href="/vault" className="flex items-center gap-2.5">
            <span className="bg-vault-gradient grid size-9 place-items-center rounded-full text-white">
              <ShieldCheck className="size-5" />
            </span>
            <div className="flex flex-col">
              <span className="font-heading text-lg font-bold tracking-tight text-foreground">
                Lindenway <span className="text-primary">Vault</span>
              </span>
              <span className="hidden text-[10px] font-medium tracking-wide text-muted-foreground uppercase sm:block">
                Trust Multi-Chain
              </span>
            </div>
          </Link>

          {/* Wallet Switcher Button */}
          <button
            type="button"
            onClick={onOpenWalletSwitcher}
            className="flex items-center gap-1.5 rounded-xl border border-border/80 bg-muted/40 px-3 py-1.5 text-xs font-bold text-foreground transition-all hover:border-primary hover:bg-muted/70 active:scale-95"
            title="Switch Wallet or Add Wallet"
          >
            <Wallet className="size-3.5 text-primary shrink-0" />
            <span className="max-w-[130px] truncate">{wallet?.name ?? "Main Vault"}</span>
            <ChevronDown className="size-3 text-muted-foreground shrink-0" />
          </button>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Network Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1.5 rounded-xl px-3 text-xs font-medium">
                {activeNetwork.symbol === "ALL" ? (
                  <Globe className="size-3.5 text-primary" />
                ) : (
                  <CryptoIcon symbol={activeNetwork.symbol} size={16} />
                )}
                <span className="hidden sm:inline">{activeNetwork.label}</span>
                <ChevronDown className="size-3.5 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel className="text-xs text-muted-foreground">Select Network</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {NETWORKS.map((net) => (
                <DropdownMenuItem
                  key={net.id}
                  onClick={() => onSelectNetwork(net.id)}
                  className="flex items-center justify-between text-xs cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    {net.symbol === "ALL" ? (
                      <Globe className="size-3.5 text-primary" />
                    ) : (
                      <CryptoIcon symbol={net.symbol} size={18} />
                    )}
                    <span>{net.label}</span>
                  </span>
                  {selectedNetwork === net.id && <Check className="size-3.5 text-primary" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Wallet Address Chip */}
          <div className="hidden sm:flex items-center rounded-xl border border-border/80 bg-card p-0.5">
            <button
              type="button"
              onClick={copyAddress}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-mono font-medium text-foreground transition-colors hover:bg-muted"
              title="Click to copy EVM address"
            >
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{shortAddress}</span>
              {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3 opacity-60" />}
            </button>
            <button
              type="button"
              onClick={onOpenReceive}
              className="grid size-7 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
              title="Show QR Code"
            >
              <QrCode className="size-3.5" />
            </button>
          </div>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="size-9 rounded-xl"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            title="Toggle theme"
          >
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>

          {/* App Switcher & Settings */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-9 rounded-xl">
                <ShieldCheck className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-semibold">{wallet?.name ?? "Main Vault Wallet"}</p>
                  <p className="text-xs text-muted-foreground">Self-Custody Multi-Chain</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onOpenAddWallet} className="flex items-center gap-2 text-xs cursor-pointer">
                <Plus className="size-3.5 text-primary" />
                <span className="font-semibold">Add / Create New Wallet</span>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/overview" className="flex items-center gap-2 text-xs">
                  <Layers className="size-3.5" />
                  <span>Go to Lindenway Banking</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin" className="flex items-center gap-2 text-xs">
                  <Globe className="size-3.5" />
                  <span>Admin Portal</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2 text-xs text-destructive cursor-pointer">
                <LogOut className="size-3.5" />
                <span>Disconnect / Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
