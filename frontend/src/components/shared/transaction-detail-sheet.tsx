"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from "./responsive-modal";
import { categoryLabels } from "@/config/categories";
import { formatDateTime } from "@/lib/dates";
import { cn } from "@/lib/utils";
import type { Transaction } from "@/types/banking";
import { CategoryIcon } from "./category-icon";
import { Money } from "./money";

const channelLabels: Record<Transaction["channel"], string> = {
  ach: "ACH transfer",
  wire: "Wire transfer",
  card: "Card payment",
  internal: "Between your accounts",
  crypto: "Crypto trade",
};

const statusLabels: Record<Transaction["status"], string> = {
  completed: "Completed",
  pending: "Pending approval",
  failed: "Declined, money returned",
};

interface TransactionDetailSheetProps {
  transaction: Transaction | null;
  onOpenChange: (open: boolean) => void;
}

export function TransactionDetailSheet({ transaction, onOpenChange }: TransactionDetailSheetProps) {
  return (
    <ResponsiveModal open={transaction !== null} onOpenChange={onOpenChange} desktop="sheet">
      <ResponsiveModalContent>{transaction && <TransactionDetail transaction={transaction} />}</ResponsiveModalContent>
    </ResponsiveModal>
  );
}

function TransactionDetail({ transaction }: { transaction: Transaction }) {
  const [copied, setCopied] = useState(false);
  const signed = transaction.direction === "credit" ? transaction.amount : -(transaction.amount + transaction.fee);

  async function copyReference() {
    try {
      await navigator.clipboard.writeText(transaction.reference);
      setCopied(true);
      toast.success("Reference copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy. Select the reference and copy it manually.");
    }
  }

  const rows: Array<[string, React.ReactNode]> = [
    ["Status", statusLabels[transaction.status]],
    ["Date", formatDateTime(transaction.createdAt)],
    ["Type", channelLabels[transaction.channel]],
    ["Category", categoryLabels[transaction.category]],
    ...(transaction.counterpartyDetail
      ? [["Details", transaction.counterpartyDetail] as [string, React.ReactNode]]
      : []),
    ["Memo", transaction.narration],
    ...(transaction.fee > 0
      ? [
          [
            "Fee",
            <Money key="fee" amount={transaction.fee} currency={transaction.currency} />,
          ] as [string, React.ReactNode],
        ]
      : []),
  ];

  return (
    <>
      <ResponsiveModalHeader className="items-start gap-4 border-b px-6 pt-8 pb-6">
        <CategoryIcon category={transaction.category} className="size-12" />
        <div className="flex flex-col gap-1">
          <ResponsiveModalDescription>{transaction.counterparty}</ResponsiveModalDescription>
          <ResponsiveModalTitle
            className={cn(
              "font-figure text-3xl font-semibold tracking-tight",
              transaction.direction === "credit" && "text-credit",
              transaction.status === "failed" && "text-muted-foreground line-through",
            )}
          >
            <Money amount={signed} currency={transaction.currency} signed />
          </ResponsiveModalTitle>
        </div>
      </ResponsiveModalHeader>
      <dl className="flex flex-col px-6 py-2">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-6 border-b border-dashed py-3.5 last:border-0">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="text-right font-medium">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="mx-6 mt-2 mb-6 flex items-center justify-between gap-3 rounded-lg bg-muted px-4 py-3">
        <div className="min-w-0">
          <p className="text-[0.72rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
            Reference
          </p>
          <p className="truncate tabular-nums text-sm">{transaction.reference}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={copyReference} aria-label="Copy reference">
          {copied ? <Check /> : <Copy />}
        </Button>
      </div>
    </>
  );
}
