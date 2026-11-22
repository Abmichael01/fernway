"use client";

import { type ReactNode, useState } from "react";
import { type DefaultValues, type FieldValues, type Resolver, useForm, type UseFormReturn, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { toAccountInput, toAdminTradeInput, toBillInput, toCardInput } from "@/api/admin";
import { ApiError } from "@/api/client";
import { applyFieldErrors, MoneyField, SelectField, SwitchField, TextField } from "@/components/admin/shared/form-fields";
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
import { FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { categoryLabels } from "@/config/categories";
import { useAddBill, useIssueCard, useOpenAccount } from "@/hooks/admin/useAdminCustomers";
import { useRecordCryptoBuy } from "@/hooks/admin/useAdminLedger";
import { toLocalInput } from "@/lib/dates";
import { CRYPTO_NAMES, CRYPTO_SYMBOLS } from "@/lib/trades";
import { type AdminTradeFormValues, adminTradeFormSchema } from "@/schemas/trade";
import {
  type AccountOpenValues,
  accountOpenFormSchema,
  type BillFormValues,
  billFormSchema,
  type CardIssueValues,
  cardIssueFormSchema,
} from "@/schemas/admin";
import type { AdminCustomer } from "@/types/admin";
import type { TransactionCategory } from "@/types/banking";

/** One small form-in-a-modal pattern shared by the admin's create dialogs. */
function FormModal<T extends FieldValues>({
  trigger,
  title,
  description,
  submitLabel,
  form,
  pending,
  onSubmit,
  children,
}: {
  trigger: ReactNode;
  title: string;
  description: string;
  submitLabel: string;
  form: UseFormReturn<T>;
  pending: boolean;
  onSubmit: (values: T) => Promise<void>;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const submit = form.handleSubmit(async (values) => {
    try {
      await onSubmit(values);
      setOpen(false);
      form.reset();
    } catch (error) {
      if (error instanceof ApiError) applyFieldErrors(form.setError, error.fieldErrors, error.message);
      else form.setError("root", { message: "We couldn't reach the server. Try again." });
    }
  });

  return (
    <ResponsiveModal open={open} onOpenChange={setOpen} dismissible={!pending}>
      <ResponsiveModalTrigger asChild>{trigger}</ResponsiveModalTrigger>
      <ResponsiveModalContent className="max-md:px-4">
        <ResponsiveModalHeader className="max-md:px-0">
          <ResponsiveModalTitle className="font-heading text-lg">{title}</ResponsiveModalTitle>
          <ResponsiveModalDescription>{description}</ResponsiveModalDescription>
        </ResponsiveModalHeader>
        <form onSubmit={submit} noValidate className="flex flex-col gap-5">
          <FieldGroup className="gap-4">{children}</FieldGroup>
          {form.formState.errors.root && (
            <p role="alert" className="text-sm text-destructive">
              {String(form.formState.errors.root.message)}
            </p>
          )}
          <ResponsiveModalFooter className="max-md:px-0">
            <Button type="submit" size="lg" disabled={pending}>
              {pending && <Spinner data-icon="inline-start" />}
              {pending ? "Saving…" : submitLabel}
            </Button>
          </ResponsiveModalFooter>
        </form>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}

function useZodForm<T extends FieldValues>(schema: Parameters<typeof zodResolver>[0], defaultValues: DefaultValues<T>) {
  return useForm<T>({ resolver: zodResolver(schema) as unknown as Resolver<T>, defaultValues, mode: "onTouched" });
}

const accountOptions = (customer: AdminCustomer) =>
  customer.accounts.map((account) => ({ value: account.id, label: account.name }));

export function OpenAccountDialog({ customer, children }: { customer: AdminCustomer; children: ReactNode }) {
  const openAccount = useOpenAccount(customer.id);
  const form = useZodForm<AccountOpenValues>(accountOpenFormSchema, {
    type: "savings",
    name: "High-yield savings",
    apy: "4.10",
    goalName: "",
    goalTarget: "",
  });
  const type = useWatch({ control: form.control, name: "type" });

  return (
    <FormModal
      trigger={children}
      title="Open an account"
      description={`A new account for ${customer.firstName}. It starts at $0.`}
      submitLabel="Open account"
      form={form}
      pending={openAccount.isPending}
      onSubmit={async (values) => {
        await openAccount.mutateAsync(toAccountInput(values));
        toast.success(`${values.name} opened`);
      }}
    >
      <SelectField
        control={form.control}
        name="type"
        label="Type"
        options={[
          { value: "checking", label: "Checking" },
          { value: "savings", label: "Savings" },
        ]}
      />
      <TextField control={form.control} name="name" label="Account name" />
      {type === "savings" && (
        <>
          <TextField control={form.control} name="apy" label="APY (%)" placeholder="4.10" />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField control={form.control} name="goalName" label="Savings goal (optional)" placeholder="Emergency fund" />
            <MoneyField control={form.control} name="goalTarget" label="Goal amount" />
          </div>
        </>
      )}
    </FormModal>
  );
}

export function IssueCardDialog({ customer, children }: { customer: AdminCustomer; children: ReactNode }) {
  const issueCard = useIssueCard(customer.id);
  const checking = customer.accounts.find((account) => account.type === "checking");
  const form = useZodForm<CardIssueValues>(cardIssueFormSchema, {
    accountId: checking?.id ?? "",
    kind: "virtual",
    label: "Online card",
    monthlyLimit: "1,000",
  });

  return (
    <FormModal
      trigger={children}
      title="Issue a card"
      description={`The card shows in ${customer.firstName}'s Cards page with their name on it.`}
      submitLabel="Issue card"
      form={form}
      pending={issueCard.isPending}
      onSubmit={async (values) => {
        await issueCard.mutateAsync(toCardInput(values));
        toast.success(`${values.label} issued`);
      }}
    >
      <SelectField control={form.control} name="accountId" label="Spends from" options={accountOptions(customer)} />
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          control={form.control}
          name="kind"
          label="Kind"
          options={[
            { value: "physical", label: "Physical debit card" },
            { value: "virtual", label: "Virtual card" },
          ]}
        />
        <TextField control={form.control} name="label" label="Card name" />
      </div>
      <MoneyField control={form.control} name="monthlyLimit" label="Monthly spending limit" />
    </FormModal>
  );
}

const billCategories = (["bills", "housing", "entertainment", "transport", "shopping", "savings"] as TransactionCategory[]).map((value) => ({
  value,
  label: categoryLabels[value],
}));

export function AddBillDialog({ customer, children }: { customer: AdminCustomer; children: ReactNode }) {
  const addBill = useAddBill(customer.id);
  const checking = customer.accounts.find((account) => account.type === "checking");
  const form = useZodForm<BillFormValues>(billFormSchema, {
    accountId: checking?.id ?? "",
    payee: "",
    category: "bills",
    amount: "",
    dayOfMonth: "1",
    autopay: true,
  });

  return (
    <FormModal
      trigger={children}
      title="Add a monthly bill"
      description={`Shows under "Upcoming bills" on ${customer.firstName}'s Overview when it's due within 30 days.`}
      submitLabel="Add bill"
      form={form}
      pending={addBill.isPending}
      onSubmit={async (values) => {
        await addBill.mutateAsync(toBillInput(values));
        toast.success(`${values.payee} added`);
      }}
    >
      <TextField control={form.control} name="payee" label="Paid to" placeholder="Verizon Wireless" />
      <div className="grid gap-4 sm:grid-cols-2">
        <MoneyField control={form.control} name="amount" label="Amount" />
        <SelectField
          control={form.control}
          name="dayOfMonth"
          label="Due on day"
          options={Array.from({ length: 28 }, (_, index) => ({ value: String(index + 1), label: `Day ${index + 1}` }))}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField control={form.control} name="category" label="Category" options={billCategories} />
        <SelectField control={form.control} name="accountId" label="Paid from" options={accountOptions(customer)} />
      </div>
      <SwitchField control={form.control} name="autopay" label="Autopay" description="Marked “Autopay” in the app." />
    </FormModal>
  );
}

/**
 * Records a crypto buy the customer made in the past. The admin chooses the coin, amount and date;
 * the price is the real market price at that moment, looked up by the server, never typed in.
 */
export function RecordCryptoBuyDialog({ customer, children }: { customer: AdminCustomer; children: ReactNode }) {
  const recordBuy = useRecordCryptoBuy(customer.id);
  const checking = customer.accounts.find((account) => account.type === "checking");
  const form = useZodForm<AdminTradeFormValues>(adminTradeFormSchema, {
    accountId: checking?.id ?? customer.accounts[0]?.id ?? "",
    symbol: "BTC",
    amount: "",
    occurredAt: "",
  });

  return (
    <FormModal
      trigger={children}
      title="Record a crypto buy"
      description={`Paid from ${customer.firstName}'s account at the market price on that date, plus the 1.25% fee. The coins show on their Crypto page.`}
      submitLabel="Record buy"
      form={form}
      pending={recordBuy.isPending}
      onSubmit={async (values) => {
        const transaction = await recordBuy.mutateAsync(toAdminTradeInput(values));
        toast.success(`Recorded: ${transaction.counterpartyDetail ?? values.symbol}`);
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          control={form.control}
          name="symbol"
          label="Coin"
          options={CRYPTO_SYMBOLS.map((symbol) => ({ value: symbol, label: `${CRYPTO_NAMES[symbol]} (${symbol})` }))}
        />
        <MoneyField control={form.control} name="amount" label="Amount spent" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField control={form.control} name="accountId" label="Paid from" options={accountOptions(customer)} />
        <TextField
          control={form.control}
          name="occurredAt"
          label="Date and time"
          type="datetime-local"
          max={toLocalInput(new Date())}
        />
      </div>
    </FormModal>
  );
}
