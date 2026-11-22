"use client";

import { useEffect, useId } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import { toTransactionInput } from "@/api/admin";
import { ApiError } from "@/api/client";
import { applyFieldErrors, MoneyField, SelectField, TextField } from "@/components/admin/shared/form-fields";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalFooter,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from "@/components/shared/responsive-modal";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { categoryLabels } from "@/config/categories";
import { useAddTransaction, useUpdateTransaction } from "@/hooks/admin/useAdminLedger";
import { toLocalInput } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";
import { type TransactionFormValues, transactionFormSchema } from "@/schemas/admin";
import type { AdminCustomer } from "@/types/admin";
import type { Transaction, TransactionCategory } from "@/types/banking";

const channelOptions = [
  { value: "card", label: "Card payment" },
  { value: "ach", label: "ACH transfer" },
  { value: "wire", label: "Wire transfer" },
  { value: "internal", label: "Between own accounts" },
  { value: "crypto", label: "Crypto" },
];
const statusOptions = [
  { value: "completed", label: "Completed" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed (money returned)" },
];
const categoryOptions = (Object.entries(categoryLabels) as Array<[TransactionCategory, string]>).map(([value, label]) => ({
  value,
  label,
}));

function defaultsFor(customer: AdminCustomer, transaction: Transaction | null): TransactionFormValues {
  if (transaction) {
    return {
      accountId: transaction.accountId,
      direction: transaction.direction,
      amount: (transaction.amount / 100).toFixed(2),
      fee: transaction.fee ? (transaction.fee / 100).toFixed(2) : "",
      counterparty: transaction.counterparty,
      counterpartyDetail: transaction.counterpartyDetail ?? "",
      narration: transaction.narration,
      category: transaction.category,
      channel: transaction.channel,
      status: transaction.status,
      occurredAt: toLocalInput(new Date(transaction.createdAt)),
      cardId: "",
    };
  }
  return {
    accountId: customer.accounts.find((account) => account.type === "checking")?.id ?? customer.accounts[0]?.id ?? "",
    direction: "credit",
    amount: "",
    fee: "",
    counterparty: "",
    counterpartyDetail: "",
    narration: "",
    category: "income",
    channel: "ach",
    status: "completed",
    occurredAt: toLocalInput(new Date()),
    cardId: "",
  };
}

interface TransactionSheetProps {
  customer: AdminCustomer;
  /** `null` adds a new transaction; a transaction edits it. */
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TransactionSheet({ customer, transaction, open, onOpenChange }: TransactionSheetProps) {
  const dateId = useId();
  const addTransaction = useAddTransaction();
  const updateTransaction = useUpdateTransaction();
  const pending = addTransaction.isPending || updateTransaction.isPending;
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: defaultsFor(customer, transaction),
    mode: "onTouched",
  });
  const { reset, control, setValue } = form;

  useEffect(() => {
    if (open) reset(defaultsFor(customer, transaction));
  }, [open, customer, transaction, reset]);

  const [direction, channel, accountId] = useWatch({ control, name: ["direction", "channel", "accountId"] });
  const account = customer.accounts.find((item) => item.id === accountId);
  const accountCards = customer.cards.filter((card) => card.accountId === accountId);

  const onSubmit = form.handleSubmit(async (values) => {
    const input = toTransactionInput(values);
    try {
      if (transaction) {
        await updateTransaction.mutateAsync({ transactionId: transaction.id, input });
        toast.success("Transaction updated");
      } else {
        await addTransaction.mutateAsync({ accountId: values.accountId, input });
        toast.success(`${values.direction === "credit" ? "Money in" : "Money out"} of ${formatMoney(input.amount, "USD")} added`);
      }
      onOpenChange(false);
    } catch (error) {
      if (error instanceof ApiError) applyFieldErrors(form.setError, error.fieldErrors, error.message);
      else form.setError("root", { message: "We couldn't reach the server. Try again." });
    }
  });

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange} desktop="sheet" dismissible={!pending}>
      <ResponsiveModalContent className="sm:max-w-lg">
        <ResponsiveModalHeader className="border-b px-6 pt-6 pb-5">
          <ResponsiveModalTitle className="font-heading text-xl">{transaction ? "Edit transaction" : "Add transaction"}</ResponsiveModalTitle>
          <ResponsiveModalDescription>
            {customer.firstName} sees this in their app straight away. Balances are worked out from these entries.
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>
        <form onSubmit={onSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <FieldGroup className="gap-5">
              <Controller
                control={control}
                name="direction"
                render={({ field }) => (
                  <Field>
                    <FieldLabel>Type</FieldLabel>
                    <ToggleGroup
                      type="single"
                      value={field.value}
                      onValueChange={(value) => {
                        if (!value) return;
                        field.onChange(value);
                        setValue("category", value === "credit" ? "income" : "shopping");
                        setValue("channel", value === "credit" ? "ach" : "card");
                      }}
                      className="grid w-full grid-cols-2 gap-2"
                    >
                      <ToggleGroupItem
                        value="credit"
                        className="h-12 rounded-md border text-sm font-medium data-[state=on]:border-credit data-[state=on]:bg-credit data-[state=on]:text-white data-[state=on]:ring-0 data-[state=on]:hover:bg-credit data-[state=on]:hover:text-white dark:data-[state=on]:text-background"
                      >
                        <ArrowDownLeft /> Money in
                      </ToggleGroupItem>
                      <ToggleGroupItem
                        value="debit"
                        className="h-12 rounded-md border text-sm font-medium data-[state=on]:border-debit data-[state=on]:bg-debit data-[state=on]:text-white data-[state=on]:ring-0 data-[state=on]:hover:bg-debit data-[state=on]:hover:text-white dark:data-[state=on]:text-background"
                      >
                        <ArrowUpRight /> Money out
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </Field>
                )}
              />

              <SelectField
                control={control}
                name="accountId"
                label="Account"
                options={customer.accounts.map((item) => ({
                  value: item.id,
                  label: `${item.name} · ${formatMoney(item.balance, item.currency)}`,
                }))}
                description={transaction ? "Moving an entry to another account isn't supported; delete it and add it again." : undefined}
              />

              <div className={cn("grid gap-4", direction === "debit" && "sm:grid-cols-[1fr_9rem]")}>
                <MoneyField
                  control={control}
                  name="amount"
                  label="Amount"
                  description={account && direction === "debit" ? `${formatMoney(account.balance, "USD")} in ${account.name}` : undefined}
                />
                {direction === "debit" && <MoneyField control={control} name="fee" label="Fee" />}
              </div>

              <TextField
                control={control}
                name="counterparty"
                label={direction === "credit" ? "From" : "To"}
                placeholder={direction === "credit" ? "Employer or sender" : "Store or person paid"}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField control={control} name="narration" label="Memo" placeholder={direction === "credit" ? "Payroll" : "Groceries"} />
                <TextField control={control} name="counterpartyDetail" label="Details (optional)" placeholder="Chase ••4458" />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <SelectField control={control} name="category" label="Category" options={categoryOptions} />
                <SelectField control={control} name="channel" label="Paid by" options={channelOptions} />
              </div>

              {channel === "card" && accountCards.length > 0 && (
                <SelectField
                  control={control}
                  name="cardId"
                  label="Card"
                  placeholder="Not linked to a card"
                  options={accountCards.map((card) => ({ value: card.id, label: `${card.label} ••${card.last4}` }))}
                  description="Card payments count toward the card's monthly spend."
                />
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <SelectField control={control} name="status" label="Status" options={statusOptions} />
                <Controller
                  control={control}
                  name="occurredAt"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={dateId}>Date and time</FieldLabel>
                      <Input
                        {...field}
                        id={dateId}
                        type="datetime-local"
                        max={toLocalInput(new Date())}
                        aria-invalid={fieldState.invalid}
                        className="h-10"
                      />
                      <FieldError errors={[fieldState.error]} />
                    </Field>
                  )}
                />
              </div>
            </FieldGroup>
            {form.formState.errors.root && (
              <p role="alert" className="mt-4 text-sm text-destructive">
                {form.formState.errors.root.message}
              </p>
            )}
          </div>
          <ResponsiveModalFooter className="border-t px-6 py-4">
            <Button type="submit" size="lg" disabled={pending}>
              {pending && <Spinner data-icon="inline-start" />}
              {pending ? "Saving…" : transaction ? "Save changes" : "Add transaction"}
            </Button>
          </ResponsiveModalFooter>
        </form>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
