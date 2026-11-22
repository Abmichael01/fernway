"use client";

import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiError } from "@/api/client";
import { Money } from "@/components/shared/money";
import { ResponsiveModalFooter } from "@/components/shared/responsive-modal";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { useInvestQuote } from "@/hooks/invest/useInvestQuote";
import { MIN_TRADE } from "@/lib/invest";
import { parseMajorAmount } from "@/lib/money";
import { type InvestAmountFormValues, investAmountFormSchema } from "@/schemas/invest";
import type { TradeSide } from "@/types/invest";
import { useDebouncedValue } from "./use-debounced-value";
import { QuoteSummary } from "./quote-summary";

interface TradeFormProps {
  side: TradeSide;
  /** Portfolio id or coin symbol. */
  target: string;
  /** Cents the customer can use, shown under the field. */
  available: number;
  availableLabel: string;
  submitLabel: string;
  /** True when prices are not live: buying and selling is paused. */
  paused: boolean;
  onSubmit: (cents: number) => Promise<void>;
  /** Offered on portfolio withdrawals. */
  onSubmitAll?: () => Promise<void>;
  note?: string;
}

export function TradeForm({ side, target, available, availableLabel, submitLabel, paused, onSubmit, onSubmitAll, note }: TradeFormProps) {
  const form = useForm<InvestAmountFormValues>({
    resolver: zodResolver(investAmountFormSchema),
    defaultValues: { amount: "" },
    mode: "onTouched",
  });
  const amountInput = useWatch({ control: form.control, name: "amount" });
  const debounced = useDebouncedValue(amountInput, 400);
  const cents = parseMajorAmount(debounced ?? "");
  const quote = useInvestQuote(side, target, cents !== null && cents >= MIN_TRADE && !paused ? cents : null);
  const quoteError = quote.error instanceof ApiError ? (quote.error.fieldErrors.amount ?? quote.error.message) : quote.error ? "We couldn't get a quote. Try again." : null;
  const typedMatchesQuote = parseMajorAmount(amountInput ?? "") === cents;

  async function run(action: () => Promise<void>) {
    try {
      await action();
    } catch (error) {
      const message = error instanceof ApiError ? (error.fieldErrors.amount ?? error.message) : "That didn't go through. Try again.";
      form.setError("amount", { message }, { shouldFocus: true });
    }
  }

  const submit = form.handleSubmit((values) =>
    run(async () => {
      const amount = parseMajorAmount(values.amount);
      if (amount !== null) await onSubmit(amount);
    }),
  );
  const [allPending, setAllPending] = useState(false);
  const busy = form.formState.isSubmitting || allPending;

  return (
    <form onSubmit={submit} noValidate className="flex flex-col">
      <div className="px-6 py-5">
        <FieldGroup>
          <Controller
            name="amount"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="invest-amount">Amount in USD</FieldLabel>
                <InputGroup className="h-14">
                  <InputGroupAddon>
                    <InputGroupText className="font-heading text-2xl">$</InputGroupText>
                  </InputGroupAddon>
                  <InputGroupInput
                    {...field}
                    id="invest-amount"
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="0.00"
                    aria-invalid={fieldState.invalid}
                    onChange={(event) => field.onChange(event.target.value.replace(/[^\d.,]/g, ""))}
                    className="font-heading text-2xl font-semibold tabular-nums md:text-2xl"
                  />
                </InputGroup>
                {!fieldState.invalid && (
                  <FieldDescription>
                    <Money amount={available} currency="USD" className="font-medium" /> {availableLabel}
                  </FieldDescription>
                )}
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
          {(cents ?? 0) >= MIN_TRADE && !paused && (
            <QuoteSummary
              side={side}
              quote={typedMatchesQuote ? quote.data : undefined}
              loading={quote.isFetching || !typedMatchesQuote}
              error={quoteError}
            />
          )}
          {paused && <p className="text-sm text-muted-foreground">Prices are delayed, so buying and selling is paused for now.</p>}
          {note && <p className="text-xs text-muted-foreground">{note}</p>}
        </FieldGroup>
      </div>
      <ResponsiveModalFooter className="border-t px-6 py-4">
        <Button type="submit" size="lg" disabled={busy || paused} className="h-12 w-full">
          {busy && <Spinner data-icon="inline-start" />}
          {submitLabel}
        </Button>
        {onSubmitAll && (
          <Button
            type="button"
            variant="outline"
            size="lg"
            disabled={busy || paused}
            className="h-12 w-full"
            onClick={() => {
              setAllPending(true);
              void run(onSubmitAll).finally(() => setAllPending(false));
            }}
          >
            Withdraw everything
          </Button>
        )}
      </ResponsiveModalFooter>
    </form>
  );
}
