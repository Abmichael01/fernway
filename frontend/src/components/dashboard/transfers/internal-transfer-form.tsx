"use client";

import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowDown } from "lucide-react";
import { toast } from "sonner";
import { ApiError } from "@/api/client";
import { Money } from "@/components/shared/money";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { useAccounts } from "@/hooks/accounts/useAccounts";
import { useMoveBetweenAccounts } from "@/hooks/accounts/useMoveBetweenAccounts";
import { formatMoney, parseMajorAmount } from "@/lib/money";
import { type InternalTransferValues, internalTransferSchema } from "@/schemas/transfer";
import type { Account, Transaction } from "@/types/banking";

export function InternalTransferForm({ onSent }: { onSent: (transaction: Transaction) => void }) {
  const { data: accounts } = useAccounts();
  const move = useMoveBetweenAccounts();
  const form = useForm<InternalTransferValues>({
    resolver: zodResolver(internalTransferSchema),
    defaultValues: { fromAccountId: "", toAccountId: "", amount: "" },
    mode: "onTouched",
  });
  const { control, setValue, setError } = form;
  const [fromAccountId] = useWatch({ control, name: ["fromAccountId"] });
  const fromAccount = accounts?.find((account) => account.id === fromAccountId);

  const checkingId = accounts?.find((account) => account.type === "checking")?.id;
  const savingsId = accounts?.find((account) => account.type === "savings")?.id;
  useEffect(() => {
    if (checkingId && savingsId && !form.getValues("fromAccountId")) {
      setValue("fromAccountId", checkingId);
      setValue("toAccountId", savingsId);
    }
  }, [checkingId, savingsId, form, setValue]);

  const onSubmit = form.handleSubmit(async (values) => {
    const amount = parseMajorAmount(values.amount);
    if (amount === null) return;
    try {
      const transaction = await move.mutateAsync({ fromAccountId: values.fromAccountId, toAccountId: values.toAccountId, amount });
      toast.success(`Moved ${formatMoney(amount, "USD")} to ${transaction.counterparty}`);
      onSent(transaction);
    } catch (error) {
      if (error instanceof ApiError) {
        const [field, message] = Object.entries(error.fieldErrors)[0] ?? [];
        if (field && message) setError(field as keyof InternalTransferValues, { message }, { shouldFocus: true });
        else setError("root", { message: error.message });
      } else {
        setError("root", { message: "The transfer didn't go through. Try again." });
      }
    }
  });

  const accountSelect = (name: "fromAccountId" | "toAccountId", label: string) => (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={name}>{label}</FieldLabel>
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger id={name} aria-invalid={fieldState.invalid} className="w-full data-[size=default]:h-12">
              <SelectValue placeholder="Choose an account" />
            </SelectTrigger>
            <SelectContent>
              {accounts?.map((account: Account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name} · <Money amount={account.availableBalance} currency={account.currency} sensitive />
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError errors={[fieldState.error]} />
        </Field>
      )}
    />
  );

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle className="font-heading text-base font-semibold">Move between your accounts</CardTitle>
        <CardDescription>Instant and free, any time.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} noValidate>
          <FieldGroup>
            {accountSelect("fromAccountId", "From")}
            <div className="-my-3 flex justify-center" aria-hidden="true">
              <span className="grid size-8 place-items-center rounded-full border bg-card">
                <ArrowDown className="size-4 text-muted-foreground" />
              </span>
            </div>
            {accountSelect("toAccountId", "To")}
            <Controller
              name="amount"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="internal-amount">Amount</FieldLabel>
                  <InputGroup className="h-14">
                    <InputGroupAddon>
                      <InputGroupText className="font-heading text-2xl">$</InputGroupText>
                    </InputGroupAddon>
                    <InputGroupInput
                      {...field}
                      id="internal-amount"
                      inputMode="decimal"
                      autoComplete="off"
                      placeholder="0.00"
                      aria-invalid={fieldState.invalid}
                      onChange={(event) => field.onChange(event.target.value.replace(/[^\d.,]/g, ""))}
                      className="font-heading text-2xl font-semibold tabular-nums md:text-2xl"
                    />
                  </InputGroup>
                  {fromAccount && !fieldState.invalid && (
                    <FieldDescription>
                      <Money amount={fromAccount.availableBalance} currency={fromAccount.currency} sensitive /> available
                    </FieldDescription>
                  )}
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
            {form.formState.errors.root && (
              <p role="alert" className="text-sm text-destructive">
                {form.formState.errors.root.message}
              </p>
            )}
            <Button type="submit" size="lg" className="h-11" disabled={move.isPending}>
              {move.isPending && <Spinner data-icon="inline-start" />}
              {move.isPending ? "Moving…" : "Move money"}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
