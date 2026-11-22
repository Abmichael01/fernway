"use client";

import { useState } from "react";
import { ArrowRight, Landmark, Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { Money } from "@/components/shared/money";
import { PinBoxesInput } from "./pin-boxes-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { siteConfig } from "@/config/site";
import { useAccounts } from "@/hooks/accounts/useAccounts";
import { useSendTransfer } from "@/hooks/transfers/useSendTransfer";
import { parseMajorAmount } from "@/lib/money";
import type { Transaction } from "@/types/banking";

const QUICK_AMOUNTS = [
  { label: "$100", value: "100" },
  { label: "$500", value: "500" },
  { label: "$1,000", value: "1000" },
  { label: "$5,000", value: "5000" },
];

export function SendMoneyForm({ onSent }: { onSent: (transaction: Transaction) => void }) {
  const { data: accounts, isPending: accountsPending } = useAccounts();
  const sendMutation = useSendTransfer();

  const [recipientName, setRecipientName] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [pin, setPin] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const primaryAccount = accounts?.[0];
  const availableBalance = primaryAccount?.balance ?? 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const name = recipientName.trim();
    const bank = bankName.trim();
    const accNo = accountNumber.trim();
    const amountCents = parseMajorAmount(amount);

    if (name.length < 2) {
      setFormError("Enter the recipient's full name.");
      return;
    }
    if (bank.length < 2) {
      setFormError("Enter the recipient's bank name.");
      return;
    }
    if (accNo.length < 4) {
      setFormError("Enter a valid account number.");
      return;
    }
    if (!amountCents || amountCents < 100) {
      setFormError("Enter an amount of at least $1.00.");
      return;
    }
    if (amountCents > availableBalance) {
      setFormError("That amount is higher than your available account balance.");
      return;
    }
    if (!/^\d{4}$/.test(pin)) {
      setFormError("Enter your 4-digit transaction PIN.");
      return;
    }

    try {
      const tx = await sendMutation.mutateAsync({
        recipientName: name,
        bankName: bank,
        accountNumber: accNo,
        routingNumber: routingNumber.trim(),
        amount: amountCents,
        memo: memo.trim(),
        pin,
      });
      toast.success("Please wait while your transaction is being completed.");
      onSent(tx);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not send transfer. Please try again.";
      if (msg.toLowerCase().includes("pin")) {
        setPin("");
      }
      setFormError(msg);
      toast.error(msg);
    }
  };

  return (
    <Card className="mx-auto w-full max-w-2xl rounded-2xl">
      <CardHeader className="border-b pb-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="font-heading text-lg font-semibold">Send to an account</CardTitle>
          <div className="flex items-center gap-2.5 rounded-xl border bg-muted/40 px-3.5 py-2">
            <span className="bg-brand-gradient grid size-8 shrink-0 place-items-center rounded-full text-white">
              <Landmark className="size-4" aria-hidden="true" />
            </span>
            <div className="text-right">
              <div className="text-[11px] text-muted-foreground">Account balance</div>
              {accountsPending ? (
                <Skeleton className="mt-0.5 h-4 w-24" />
              ) : (
                <div className="font-heading text-sm font-semibold">
                  <Money amount={availableBalance} currency={siteConfig.defaultCurrency} sensitive />
                </div>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {formError && (
            <div
              role="alert"
              className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {formError}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="transfer-recipient">Recipient full name</Label>
              <Input
                id="transfer-recipient"
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="e.g. John Smith"
                className="h-10 rounded-xl"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="transfer-bank">Bank name</Label>
              <Input
                id="transfer-bank"
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="e.g. Chase Bank"
                className="h-10 rounded-xl"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="transfer-account">Account number</Label>
              <Input
                id="transfer-account"
                type="text"
                inputMode="numeric"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Enter account number"
                className="h-10 rounded-xl font-mono"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="transfer-routing">
                Routing number <span className="font-normal text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="transfer-routing"
                type="text"
                inputMode="numeric"
                value={routingNumber}
                onChange={(e) => setRoutingNumber(e.target.value)}
                placeholder="e.g. 021000021"
                className="h-10 rounded-xl font-mono"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="transfer-amount">Amount (USD)</Label>
            <Input
              id="transfer-amount"
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="h-11 rounded-xl font-heading text-lg font-medium"
              required
            />
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {QUICK_AMOUNTS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setAmount(preset.value)}
                  className={`rounded-lg border px-3 py-1 text-xs font-medium transition-colors ${
                    amount === preset.value
                      ? "border-primary bg-primary text-white"
                      : "border-border bg-muted/40 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="transfer-memo">
              Note <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="transfer-memo"
              type="text"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="What is this payment for?"
              className="h-10 rounded-xl"
              maxLength={160}
            />
          </div>

          <div className="flex flex-col gap-2 rounded-xl border bg-muted/25 p-4">
            <div className="flex items-center gap-2">
              <Lock className="size-4 text-muted-foreground" aria-hidden="true" />
              <Label htmlFor="transfer-pin">Transaction PIN</Label>
            </div>
            <p className="text-xs text-muted-foreground">
              Enter your 4-digit transaction PIN to authorize this transfer.
            </p>
            <div className="pt-1">
              <PinBoxesInput
                id="transfer-pin"
                value={pin}
                onChange={setPin}
                disabled={sendMutation.isPending}
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
            <span>Transfer fee</span>
            <span className="font-semibold text-foreground">$0.00</span>
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={sendMutation.isPending || accountsPending}
            className="h-11 w-full rounded-xl font-semibold"
          >
            {sendMutation.isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Sending transfer...
              </>
            ) : (
              <>
                Send money
                <ArrowRight className="ml-2 size-4" />
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
