"use client";

import { useState } from "react";
import { CreditCard, ShieldCheck } from "lucide-react";
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
import { useAccounts } from "@/hooks/accounts/useAccounts";
import { useCreateCard } from "@/hooks/cards/useCreateCard";
import { useCurrentUser } from "@/hooks/users/useCurrentUser";
import { formatMoney } from "@/lib/money";

interface CreateCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const QUICK_LIMITS = [
  { label: "$500", cents: 500_00 },
  { label: "$1,000", cents: 1_000_00 },
  { label: "$2,500", cents: 2_500_00 },
  { label: "$5,000", cents: 5_000_00 },
  { label: "$10,000", cents: 10_000_00 },
];

const SUGGESTED_LABELS = [
  "Everyday Debit",
  "Travel Card",
  "Business & Work",
  "Household",
];

export function CreateCardDialog({ open, onOpenChange }: CreateCardDialogProps) {
  const { data: accounts = [] } = useAccounts();
  const { data: user } = useCurrentUser();
  const createCardMutation = useCreateCard();

  const primaryAccount = accounts[0];

  const [selectedAccountId, setSelectedAccountId] = useState<string>(primaryAccount?.id ?? "");
  const [label, setLabel] = useState("Everyday Debit");
  const [monthlyLimitCents, setMonthlyLimitCents] = useState<number>(2_500_00);
  const [customLimit, setCustomLimit] = useState("");

  const effectiveAccountId = selectedAccountId || primaryAccount?.id || "";
  const holderName = user ? `${user.firstName} ${user.lastName}`.toUpperCase() : "FERNWAY MEMBER";

  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!effectiveAccountId) {
      toast.error("Please select an account to link this card to.");
      return;
    }
    if (!label.trim()) {
      toast.error("Please give your card a nickname.");
      return;
    }

    const finalLimit = customLimit ? Math.round(parseFloat(customLimit) * 100) : monthlyLimitCents;
    if (isNaN(finalLimit) || finalLimit < 100_00) {
      toast.error("Monthly limit must be at least $100.");
      return;
    }
    if (finalLimit > 1_000_000_00) {
      toast.error("Monthly limit cannot exceed $10,000.");
      return;
    }

    try {
      await createCardMutation.mutateAsync({
        accountId: effectiveAccountId,
        kind: "physical",
        label: label.trim(),
        monthlyLimit: finalLimit,
      });

      toast.success(`Physical debit card "${label.trim()}" ordered successfully!`);
      onOpenChange(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to issue physical card");
    }
  };

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange} desktop="dialog">
      <ResponsiveModalContent className="sm:max-w-md">
        <ResponsiveModalHeader>
          <ResponsiveModalTitle className="flex items-center gap-2">
            <CreditCard className="size-4 text-primary" />
            Add a Physical Card
          </ResponsiveModalTitle>
          <ResponsiveModalDescription>
            Order a physical debit card linked directly to your account balance.
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>

        <form onSubmit={handleCreateCard} className="mt-2 flex flex-col gap-4">
          {/* Interactive Physical Card Preview */}
          <div className="relative overflow-hidden rounded-2xl p-5 text-white shadow-md transition-all">
            <div className="absolute inset-0 bg-[radial-gradient(130%_150%_at_0%_0%,#343846_0%,#1a1c23_48%,#0b0c10_100%)]" />
            <div className="relative z-10 flex flex-col justify-between h-36">
              <div className="flex items-center justify-between">
                <span className="font-heading text-sm font-extrabold tracking-wider">FERNWAY</span>
                <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur-xs">
                  Physical Debit
                </span>
              </div>

              <div>
                <p className="text-[11px] font-semibold text-white/80 uppercase tracking-wider">
                  {label || "Everyday Debit"}
                </p>
                <p className="mt-1 font-mono text-base tracking-widest text-white/90">
                  •••• •••• •••• ••••
                </p>
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <span className="font-mono tracking-wider text-white/80">{holderName}</span>
                <span className="font-bold tracking-widest text-white">VISA</span>
              </div>
            </div>
          </div>

          {/* Link to Account (only show selector when multiple accounts exist) */}
          {accounts.length > 1 && (
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold">Linked Account</Label>
              <Select
                value={effectiveAccountId}
                onValueChange={setSelectedAccountId}
              >
                <SelectTrigger className="h-10 rounded-xl text-xs">
                  <SelectValue placeholder="Choose an account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((acc) => (
                    <SelectItem key={acc.id} value={acc.id} className="text-xs">
                      {acc.name} ••{acc.accountNumber.slice(-4)} ({formatMoney(acc.balance, "USD")})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Card Nickname */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold">Card Label</Label>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Everyday Debit, Travel Card..."
              className="h-10 rounded-xl text-xs"
              maxLength={30}
            />
            <div className="flex flex-wrap gap-1.5 pt-1">
              {SUGGESTED_LABELS.map((sugg) => (
                <button
                  key={sugg}
                  type="button"
                  onClick={() => setLabel(sugg)}
                  className={`rounded-lg px-2 py-0.5 text-[10px] font-medium transition-colors ${
                    label === sugg
                      ? "bg-primary text-white font-bold"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {sugg}
                </button>
              ))}
            </div>
          </div>

          {/* Monthly Spending Limit */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">Monthly Spend Limit</Label>
              <span className="text-xs font-mono font-bold text-primary">
                {customLimit ? `$${parseFloat(customLimit || "0").toLocaleString()}` : formatMoney(monthlyLimitCents, "USD")}
              </span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {QUICK_LIMITS.map((lim) => (
                <button
                  key={lim.cents}
                  type="button"
                  onClick={() => {
                    setMonthlyLimitCents(lim.cents);
                    setCustomLimit("");
                  }}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                    monthlyLimitCents === lim.cents && !customLimit
                      ? "bg-primary text-white"
                      : "border border-border/80 bg-card text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {lim.label}
                </button>
              ))}
            </div>

            <Input
              type="number"
              min={100}
              max={10000}
              step={50}
              value={customLimit}
              onChange={(e) => setCustomLimit(e.target.value)}
              placeholder="Or enter custom limit ($100 - $10,000)..."
              className="h-9 rounded-xl text-xs mt-1"
            />
          </div>

          <div className="rounded-xl border border-border/70 bg-muted/30 p-3 text-xs text-muted-foreground leading-relaxed flex items-start gap-2">
            <ShieldCheck className="size-4 shrink-0 text-primary mt-0.5" />
            <span>
              Your physical debit card will appear in the app right away so you can manage limits or freeze it anytime.
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
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
              disabled={createCardMutation.isPending || accounts.length === 0}
              className="bg-primary flex-1 h-10 rounded-xl text-xs font-bold text-white hover:opacity-95"
            >
              {createCardMutation.isPending ? "Ordering Card..." : "Order Physical Card"}
            </Button>
          </div>
        </form>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
