"use client";

import { type ReactNode, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { z } from "zod";
import { ApiError } from "@/api/client";
import { applyFieldErrors, TextField } from "@/components/admin/shared/form-fields";
import { Money } from "@/components/shared/money";
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
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { usePayWithdrawal } from "@/hooks/admin-invest/usePayWithdrawal";
import { useRejectWithdrawal } from "@/hooks/admin-invest/useRejectWithdrawal";
import { adminWithdrawalPaySchema, adminWithdrawalRejectSchema } from "@/schemas/invest";
import type { AdminWithdrawal } from "@/types/invest";
import { Controller } from "react-hook-form";

type PayValues = z.infer<typeof adminWithdrawalPaySchema>;
type RejectValues = z.infer<typeof adminWithdrawalRejectSchema>;

export function PayWithdrawalModal({ withdrawal, children }: { withdrawal: AdminWithdrawal; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pay = usePayWithdrawal(withdrawal.id);
  const form = useForm<PayValues>({ resolver: zodResolver(adminWithdrawalPaySchema), defaultValues: { txid: "" } });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await pay.mutateAsync(values.txid);
      toast.success("Withdrawal marked as paid");
      setOpen(false);
    } catch (error) {
      if (error instanceof ApiError) applyFieldErrors(form.setError, error.fieldErrors, error.message);
      else form.setError("root", { message: "We couldn't reach the server. Try again." });
    }
  });

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) form.reset({ txid: "" });
      }}
      dismissible={!pay.isPending}
    >
      <ResponsiveModalTrigger asChild>{children}</ResponsiveModalTrigger>
      <ResponsiveModalContent>
        <ResponsiveModalHeader className="px-6 pt-6">
          <ResponsiveModalTitle className="font-heading text-xl">Mark as paid</ResponsiveModalTitle>
          <ResponsiveModalDescription>
            {withdrawal.customer.name}, <Money amount={withdrawal.amount} currency="USD" /> in {withdrawal.symbol}. Send the payment
            from the company wallet first, then paste its transaction ID.
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4 px-6 pt-2 pb-6">
          <TextField control={form.control} name="txid" label="Transaction ID" />
          {form.formState.errors.root && (
            <p role="alert" className="text-sm text-destructive">
              {form.formState.errors.root.message}
            </p>
          )}
          <ResponsiveModalFooter className="p-0">
            <Button type="submit" size="lg" disabled={pay.isPending}>
              {pay.isPending && <Spinner data-icon="inline-start" />}
              Mark as paid
            </Button>
          </ResponsiveModalFooter>
        </form>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}

export function RejectWithdrawalModal({ withdrawal, children }: { withdrawal: AdminWithdrawal; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const reject = useRejectWithdrawal(withdrawal.id);
  const form = useForm<RejectValues>({ resolver: zodResolver(adminWithdrawalRejectSchema), defaultValues: { reason: "" } });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await reject.mutateAsync(values.reason);
      toast.success("Withdrawal declined");
      setOpen(false);
    } catch (error) {
      if (error instanceof ApiError) applyFieldErrors(form.setError, error.fieldErrors, error.message);
      else form.setError("root", { message: "We couldn't reach the server. Try again." });
    }
  });

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) form.reset({ reason: "" });
      }}
      dismissible={!reject.isPending}
    >
      <ResponsiveModalTrigger asChild>{children}</ResponsiveModalTrigger>
      <ResponsiveModalContent>
        <ResponsiveModalHeader className="px-6 pt-6">
          <ResponsiveModalTitle className="font-heading text-xl">Decline withdrawal</ResponsiveModalTitle>
          <ResponsiveModalDescription>
            {withdrawal.customer.name}, <Money amount={withdrawal.amount} currency="USD" />. The money returns to their investing
            cash.
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4 px-6 pt-2 pb-6">
          <Controller
            control={form.control}
            name="reason"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="reject-reason">Reason</FieldLabel>
                <Textarea {...field} id="reject-reason" rows={3} aria-invalid={fieldState.invalid} />
                {!fieldState.invalid && <FieldDescription>The customer sees this reason.</FieldDescription>}
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
          {form.formState.errors.root && (
            <p role="alert" className="text-sm text-destructive">
              {form.formState.errors.root.message}
            </p>
          )}
          <ResponsiveModalFooter className="p-0">
            <Button type="submit" size="lg" variant="destructive" disabled={reject.isPending}>
              {reject.isPending && <Spinner data-icon="inline-start" />}
              Decline withdrawal
            </Button>
          </ResponsiveModalFooter>
        </form>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
