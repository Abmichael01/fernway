"use client";

import { useState } from "react";
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  CheckCircle2,
  Copy,
  Gift,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import type { VaultTransaction, VaultTxType } from "@/types/vault";

interface HistoryTabProps {
  transactions: VaultTransaction[];
}

export function HistoryTab({ transactions }: HistoryTabProps) {
  const [filter, setFilter] = useState<string>("all");

  const filtered =
    filter === "all"
      ? transactions
      : transactions.filter((t) => t.type === filter);

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    toast.success("Transaction hash copied");
  };

  const getIcon = (type: VaultTxType) => {
    switch (type) {
      case "send":
        return <ArrowUpRight className="size-4 text-rose-500" />;
      case "receive":
        return <ArrowDownLeft className="size-4 text-emerald-500" />;
      case "swap":
        return <ArrowLeftRight className="size-4 text-[var(--primary)]" />;
      case "stake":
      case "unstake":
        return <Lock className="size-4 text-amber-500" />;
      case "claim":
        return <Gift className="size-4 text-emerald-500" />;
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {["all", "receive", "send", "swap", "stake"].map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`capitalize rounded-xl px-3.5 py-1 text-xs font-semibold transition-colors ${
              filter === f
                ? "bg-foreground text-background"
                : "border border-border/80 bg-card text-muted-foreground hover:bg-muted"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Transaction List */}
      <div className="divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/80 bg-card dark:bg-[#0E121A]">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            No transactions found
          </div>
        ) : (
          filtered.map((tx) => {
            const shortHash = `${tx.txHash.slice(0, 8)}...${tx.txHash.slice(-6)}`;
            const date = new Date(tx.occurredAt);
            const formattedDate = date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={tx.id}
                className="flex flex-col gap-2 p-4 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between sm:px-5"
              >
                <div className="flex items-center gap-3.5">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-muted/60">
                    {getIcon(tx.type)}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold capitalize text-foreground">
                        {tx.type} {tx.symbol}
                      </span>
                      <Badge variant="outline" className="h-4 border-emerald-500/30 px-1 text-[10px] text-emerald-500">
                        <CheckCircle2 className="size-2.5 mr-0.5" />
                        Completed
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formattedDate}</span>
                      <span>·</span>
                      <span>{tx.network}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-row items-center justify-between gap-4 pl-13 sm:flex-col sm:items-end sm:pl-0">
                  <div className="text-right">
                    <span
                      className={`font-semibold font-mono ${
                        tx.type === "receive" || tx.type === "claim"
                          ? "text-emerald-500"
                          : tx.type === "send"
                          ? "text-rose-500"
                          : "text-foreground"
                      }`}
                    >
                      {tx.type === "receive" || tx.type === "claim" ? "+" : tx.type === "send" ? "−" : ""}
                      {tx.amount} {tx.symbol}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <button
                      type="button"
                      onClick={() => copyHash(tx.txHash)}
                      className="flex items-center gap-1 font-mono hover:text-foreground"
                      title="Copy TxHash"
                    >
                      <span>{shortHash}</span>
                      <Copy className="size-3 opacity-60" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
