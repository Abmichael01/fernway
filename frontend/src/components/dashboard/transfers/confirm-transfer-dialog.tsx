"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ApiError } from "@/api/client";
import { Money } from "@/components/shared/money";
import { Button } from "@/components/ui/button";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalFooter,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from "@/components/shared/responsive-modal";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { useSendTransfer } from "@/hooks/transfers/useSendTransfer";
import { useTransferQuote } from "@/hooks/transfers/useTransferQuote";
import { useCurrentUser } from "@/hooks/users/useCurrentUser";
import { formatMoney } from "@/lib/money";
import { maskAccountNumber } from "@/lib/routing";
import { type TransferFormValues, type VerificationValues, verificationSchema } from "@/schemas/transfer";
import type { Account, MinorUnits, Transaction } from "@/types/banking";

export interface PendingTransfer {
  values: TransferFormValues;
  amount: MinorUnits;
  bankName: string;
  fromAccount: Account;
}

interface ConfirmTransferDialogProps {
  transfer: PendingTransfer | null;
  onClose: () => void;
  onSent: (transaction: Transaction) => void;
  onFieldError: (field: keyof TransferFormValues, message: string) => void;
}

const methodLabels = { ach: "Standard ACH", same_day_ach: "Same-day ACH", wire: "Wire transfer" } as const;

export function ConfirmTransferDialog({ transfer, onClose, onSent, onFieldError }: ConfirmTransferDialogProps) {
  const sendTransfer = useSendTransfer();
  const { data: user } = useCurrentUser();
  const quote = useTransferQuote(transfer?.values.method ?? "ach", transfer?.amount ?? null);
  const codeForm = useForm<VerificationValues>({ resolver: zodResolver(verificationSchema), defaultValues: { code: "" } });
  const { reset } = codeForm;

  useEffect(() => {
    if (transfer) reset({ code: "" });
  }, [transfer, reset]);

  if (!transfer) return null;
  const { values, fromAccount } = transfer;
  const currency = fromAccount.currency;

  const submit = codeForm.handleSubmit(async ({ code }) => {
    try {
      const transaction = await sendTransfer.mutateAsync({
        fromAccountId: values.fromAccountId,
        recipientName: values.recipientName,
        routingNumber: values.routingNumber,
        accountNumber: values.accountNumber,
        accountType: values.accountType,
        method: values.method,
        amount: transfer.amount,
        memo: values.memo,
        saveRecipient: values.saveRecipient,
        verificationCode: code,
      });
      toast.success(`Sent ${formatMoney(transfer.amount, currency)} to ${transaction.counterparty}`);
      onClose();
      onSent(transaction);
    } catch (error) {
      if (!(error instanceof ApiError)) {
        toast.error("The transfer didn't go through. Check your connection and try again.");
        return;
      }
      if (error.fieldErrors.verificationCode) {
        codeForm.setError("code", { message: error.fieldErrors.verificationCode }, { shouldFocus: true });
        return;
      }
      const [field, message] = Object.entries(error.fieldErrors)[0] ?? [];
      if (field && message) {
        onClose();
        onFieldError(field as keyof TransferFormValues, message);
        return;
      }
      codeForm.setError("root", { message: error.message });
    }
  });

  const rows: Array<[string, React.ReactNode]> = [
    ["To", <span key="to" className="font-medium">{values.recipientName}</span>],
    ["Bank", `${transfer.bankName} · ${values.accountType === "checking" ? "Checking" : "Savings"} ${maskAccountNumber(values.accountNumber)}`],
    ["From", fromAccount.name],
    ["Speed", methodLabels[values.method]],
    ["Arrives", quote.data ? quote.data.arrivesBy : <Skeleton key="eta" className="h-4 w-24" />],
    ...(values.memo ? [["Memo", values.memo] as [string, React.ReactNode]] : []),
    ["Fee", quote.data ? <Money key="fee" amount={quote.data.fee} currency={currency} /> : <Skeleton key="fee" className="h-4 w-12" />],
  ];

  return (
    <ResponsiveModal open onOpenChange={(open) => !open && onClose()} dismissible={!sendTransfer.isPending}>
      <ResponsiveModalContent className="max-md:px-4">
        <ResponsiveModalHeader className="max-md:px-0">
          <ResponsiveModalDescription>You&apos;re sending</ResponsiveModalDescription>
          <ResponsiveModalTitle className="font-heading text-4xl font-bold tracking-tight">
            <Money amount={transfer.amount} currency={currency} />
          </ResponsiveModalTitle>
        </ResponsiveModalHeader>

        <dl className="flex flex-col text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-6 border-b border-dashed py-2.5">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="text-right">{value}</dd>
            </div>
          ))}
          <div className="flex items-center justify-between gap-6 py-3">
            <dt className="font-medium">Total</dt>
            <dd className="font-heading font-bold">
              {quote.data ? <Money amount={quote.data.total} currency={currency} /> : <Skeleton className="h-4 w-24" />}
            </dd>
          </div>
        </dl>

        <form onSubmit={submit} noValidate className="flex flex-col gap-4">
          <Controller
            name="code"
            control={codeForm.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="code">Verification code</FieldLabel>
                <FieldDescription>
                  Enter the 6-digit verification code for the number ending {user?.phone.slice(-4) || "on file"}.
                </FieldDescription>
                <InputOTP
                  id="code"
                  maxLength={6}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  autoFocus
                  aria-invalid={fieldState.invalid}
                  containerClassName="justify-center py-1"
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} className="size-11 text-lg" />
                    <InputOTPSlot index={1} className="size-11 text-lg" />
                    <InputOTPSlot index={2} className="size-11 text-lg" />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} className="size-11 text-lg" />
                    <InputOTPSlot index={4} className="size-11 text-lg" />
                    <InputOTPSlot index={5} className="size-11 text-lg" />
                  </InputOTPGroup>
                </InputOTP>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
          {codeForm.formState.errors.root && (
            <p role="alert" className="text-sm text-destructive">
              {codeForm.formState.errors.root.message}
            </p>
          )}
          <ResponsiveModalFooter className="max-md:px-0">
            <Button type="button" variant="outline" size="lg" onClick={onClose} disabled={sendTransfer.isPending}>
              Edit details
            </Button>
            <Button type="submit" size="lg" disabled={sendTransfer.isPending || !quote.data}>
              {sendTransfer.isPending && <Spinner data-icon="inline-start" />}
              {sendTransfer.isPending ? "Sending…" : `Send ${formatMoney(transfer.amount, currency)}`}
            </Button>
          </ResponsiveModalFooter>
        </form>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
