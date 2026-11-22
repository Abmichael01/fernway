"use client";

import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ApiError } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { CoinIcon } from "@/components/shared/coin-icon";
import { useRequestWithdrawal } from "@/hooks/invest/useRequestWithdrawal";
import { addressHint, COIN_NETWORKS, CRYPTO_NAMES, CRYPTO_SYMBOLS } from "@/lib/invest";
import { formatMoney, parseMajorAmount } from "@/lib/money";
import { type WithdrawalFormValues, withdrawalFormSchema } from "@/schemas/invest";

export function WithdrawForm({ cash }: { cash: number }) {
  const request = useRequestWithdrawal();
  const form = useForm<WithdrawalFormValues>({
    resolver: zodResolver(withdrawalFormSchema),
    defaultValues: { symbol: "BTC", address: "", amount: "" },
    mode: "onTouched",
  });
  const symbol = useWatch({ control: form.control, name: "symbol" });

  const onSubmit = form.handleSubmit(async (values) => {
    const amount = parseMajorAmount(values.amount);
    if (amount === null) return;
    try {
      await request.mutateAsync({ symbol: values.symbol, address: values.address.trim(), amount });
      toast.success(`Requested ${formatMoney(amount, "USD")} in ${CRYPTO_NAMES[values.symbol]}`);
      form.reset({ symbol: values.symbol, address: "", amount: "" });
    } catch (error) {
      if (error instanceof ApiError) {
        let mapped = false;
        for (const field of ["symbol", "address", "amount"] as const) {
          const message = error.fieldErrors[field];
          if (message) {
            form.setError(field, { message });
            mapped = true;
          }
        }
        if (!mapped) form.setError("root", { message: error.message });
      } else {
        form.setError("root", { message: "The request didn't go through. Try again." });
      }
    }
  });

  const rootError = form.formState.errors.root?.message;

  return (
    <form onSubmit={onSubmit} noValidate>
      <FieldGroup>
        <Controller
          name="symbol"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="withdraw-coin">Coin</FieldLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="withdraw-coin" className="w-full data-[size=default]:h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CRYPTO_SYMBOLS.map((item) => (
                    <SelectItem key={item} value={item}>
                      <CoinIcon symbol={item} className="size-6 text-xs" />
                      {CRYPTO_NAMES[item]} · {COIN_NETWORKS[item].network}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Controller
          name="address"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="withdraw-address">Address</FieldLabel>
              <Input {...field} id="withdraw-address" autoComplete="off" spellCheck={false} aria-invalid={fieldState.invalid} className="h-11 font-mono text-sm" />
              {!fieldState.invalid && <FieldDescription>{addressHint(symbol)}</FieldDescription>}
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Controller
          name="amount"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="withdraw-amount">Amount in USD</FieldLabel>
              <InputGroup className="h-12">
                <InputGroupAddon>
                  <InputGroupText>$</InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                  {...field}
                  id="withdraw-amount"
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder="0.00"
                  aria-invalid={fieldState.invalid}
                  onChange={(event) => field.onChange(event.target.value.replace(/[^\d.,]/g, ""))}
                  className="tabular-nums"
                />
              </InputGroup>
              {!fieldState.invalid && <FieldDescription>Up to {formatMoney(cash, "USD")} available.</FieldDescription>}
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        {rootError && (
          <p role="alert" className="text-sm text-debit">
            {rootError}
          </p>
        )}
        <Button type="submit" size="lg" disabled={form.formState.isSubmitting} className="h-12 w-full">
          {form.formState.isSubmitting && <Spinner data-icon="inline-start" />}
          Request withdrawal
        </Button>
      </FieldGroup>
    </form>
  );
}
