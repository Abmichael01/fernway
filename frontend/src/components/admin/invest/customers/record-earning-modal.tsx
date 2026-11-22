"use client";

import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { ApiError } from "@/api/client";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalFooter,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalTrigger,
} from "@/components/shared/responsive-modal";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { useRecordInvestEarning } from "@/hooks/admin-invest/useRecordInvestEarning";
import type { PortfolioPosition } from "@/types/invest";

interface Props {
  customerId: string;
  positions: PortfolioPosition[];
  children: ReactNode;
}

export function RecordEarningModal({ customerId, positions, children }: Props) {
  const [open, setOpen] = useState(false);
  const [amountText, setAmountText] = useState("");
  const [portfolioId, setPortfolioId] = useState<string>("none");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const record = useRecordInvestEarning(customerId);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    const parsed = Number.parseFloat(amountText);
    const cents = Number.isFinite(parsed) ? Math.round(parsed * 100) : 0;
    if (cents <= 0) {
      setError("Enter an earning amount above $0.00.");
      return;
    }
    try {
      await record.mutateAsync({
        amount: cents,
        portfolioId: portfolioId === "none" ? null : portfolioId,
        note: note.trim(),
      });
      toast.success("Daily earning recorded");
      setAmountText("");
      setNote("");
      setOpen(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not record earning.");
    }
  };

  return (
    <ResponsiveModal open={open} onOpenChange={setOpen} desktop="dialog" dismissible={!record.isPending}>
      <ResponsiveModalTrigger asChild>{children}</ResponsiveModalTrigger>
      <ResponsiveModalContent className="sm:max-w-md">
        <ResponsiveModalHeader className="border-b px-6 pt-6 pb-4">
          <ResponsiveModalTitle className="font-heading text-xl">Record daily earning</ResponsiveModalTitle>
          <ResponsiveModalDescription>
            Credit what this customer earned today in USD. It will appear immediately in their balance and transactions.
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="px-6 py-5">
            <FieldGroup className="gap-4">
              <Field data-invalid={!!error}>
                <FieldLabel htmlFor="earning-amount">Amount earned today (USD)</FieldLabel>
                <Input
                  id="earning-amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="25.00"
                  value={amountText}
                  onChange={(e) => setAmountText(e.target.value)}
                />
                {error && <FieldError errors={[{ message: error }]} />}
              </Field>

              {positions.length > 0 && (
                <Field>
                  <FieldLabel htmlFor="earning-offering">Offering (optional)</FieldLabel>
                  <Select value={portfolioId} onValueChange={setPortfolioId}>
                    <SelectTrigger id="earning-offering">
                      <SelectValue placeholder="General earning" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">General investment earning</SelectItem>
                      {positions.map((pos) => (
                        <SelectItem key={pos.portfolio.id} value={pos.portfolio.id}>
                          {pos.portfolio.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}

              <Field>
                <FieldLabel htmlFor="earning-note">Note (optional)</FieldLabel>
                <Input
                  id="earning-note"
                  placeholder="Daily return payout"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
                <FieldDescription>Shown to the customer in their transaction history.</FieldDescription>
              </Field>
            </FieldGroup>
          </div>
          <ResponsiveModalFooter className="border-t px-6 py-4">
            <Button type="submit" disabled={record.isPending}>
              {record.isPending && <Spinner data-icon="inline-start" />}
              Credit earning
            </Button>
          </ResponsiveModalFooter>
        </form>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
