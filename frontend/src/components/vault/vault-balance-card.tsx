"use client";

import { useState } from "react";
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  CreditCard,
  Eye,
  EyeOff,
  Percent,
  RefreshCw,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { formatMoney } from "@/lib/money";

interface VaultBalanceCardProps {
  totalValueUsd: number;
  change24hUsd: number;
  change24hPercent: number;
  totalStakedUsd: number;
  onChainProvider?: string;
  isSyncing?: boolean;
  onSyncOnChain?: () => void;
  onSend: () => void;
  onReceive: () => void;
  onBuy: () => void;
  onSwap: () => void;
  onEarn: () => void;
}

export function VaultBalanceCard({
  totalValueUsd,
  change24hUsd,
  change24hPercent,
  totalStakedUsd,
  onChainProvider,
  isSyncing,
  onSyncOnChain,
  onSend,
  onReceive,
  onBuy,
  onSwap,
  onEarn,
}: VaultBalanceCardProps) {
  const [hideBalance, setHideBalance] = useState(false);
  const isPositive = change24hUsd >= 0;

  // Convert USD dollar amount to minor units (cents) for formatMoney
  const centsTotal = Math.round(totalValueUsd * 100);
  const centsChange = Math.round(Math.abs(change24hUsd) * 100);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card p-6 dark:bg-[#0E121A]">
      <div className="relative flex flex-col items-center text-center">
        {/* Live On-Chain Connection Badge */}
        {onSyncOnChain && (
          <div className="mb-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onSyncOnChain}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/40 px-3 py-1 text-[11px] font-semibold text-muted-foreground transition-all hover:border-primary hover:text-foreground active:scale-95"
              title="Click to query live on-chain balances from Infura / RPC"
            >
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
              </span>
              <span>{onChainProvider ?? "Infura / Ethereum RPC"}</span>
              <RefreshCw className={`size-3 ${isSyncing ? "animate-spin text-primary" : "text-muted-foreground"}`} />
            </button>
          </div>
        )}

        {/* Label and hide toggle */}
        <div className="flex items-center gap-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          <span>Total Balance</span>
          <button
            type="button"
            onClick={() => setHideBalance(!hideBalance)}
            className="grid size-6 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label={hideBalance ? "Show balance" : "Hide balance"}
          >
            {hideBalance ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
          </button>
        </div>

        {/* Big Net Worth */}
        <div className="mt-2 text-4xl font-extrabold tracking-tight font-heading text-foreground sm:text-5xl">
          {hideBalance ? "••••••••" : formatMoney(centsTotal, "USD")}
        </div>

        {/* 24h PnL badge */}
        <div className="mt-2.5 flex items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              isPositive
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
            }`}
          >
            {isPositive ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
            <span>
              {isPositive ? "+" : "−"}
              {hideBalance ? "•••" : formatMoney(centsChange, "USD")} ({isPositive ? "+" : ""}
              {change24hPercent.toFixed(2)}%)
            </span>
          </span>
          <span className="text-xs text-muted-foreground">past 24h</span>
        </div>

        {totalStakedUsd > 0 && (
          <div className="mt-2 text-xs text-muted-foreground">
            Staked earning yield:{" "}
            <span className="font-semibold text-foreground">
              {hideBalance ? "••••" : formatMoney(Math.round(totalStakedUsd * 100), "USD")}
            </span>
          </div>
        )}

        {/* Trust Wallet Action Buttons Row */}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-6 sm:gap-10">
          <ActionButton icon={ArrowUpRight} label="Send" onClick={onSend} color="bg-primary" />
          <ActionButton icon={ArrowDownLeft} label="Receive" onClick={onReceive} color="bg-primary" />
          <ActionButton icon={CreditCard} label="Buy" onClick={onBuy} color="bg-primary" />
          <ActionButton icon={ArrowLeftRight} label="Swap" onClick={onSwap} color="bg-primary" />
          <ActionButton icon={Percent} label="Earn" onClick={onEarn} color="bg-emerald-600" />
        </div>
      </div>
    </div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  color?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col items-center gap-1.5 focus:outline-none"
    >
      <span
        className={`grid size-12 place-items-center rounded-full ${
          color ?? "bg-primary"
        } text-white border border-border/20 transition-transform duration-200 group-hover:scale-105 active:scale-95`}
      >
        <Icon className="size-5" />
      </span>
      <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">{label}</span>
    </button>
  );
}
