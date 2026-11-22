"use client";

import { useDeferredValue, useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ApiError } from "@/api/client";
import { CoinIcon } from "@/components/shared/coin-icon";
import { Money } from "@/components/shared/money";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalFooter,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from "@/components/shared/responsive-modal";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAccounts } from "@/hooks/accounts/useAccounts";
import { usePlaceTrade, useTradeQuote } from "@/hooks/crypto/useCrypto";
import { formatQuantity, holdingValue } from "@/lib/crypto";
import { formatMoney, parseMajorAmount } from "@/lib/money";
import { type TradeValues, tradeSchema } from "@/schemas/trade";
import type { CryptoAsset, CryptoSymbol, TradeSide } from "@/types/banking";

interface TradeSheetProps {
  trade: { side: TradeSide; symbol: CryptoSymbol } | null;
  assets: CryptoAsset[];
  onOpenChange: (open: boolean) => void;
}

export function TradeSheet({ trade, assets, onOpenChange }: TradeSheetProps) {
  return (
    <ResponsiveModal open={trade !== null} onOpenChange={onOpenChange} desktop="sheet">
      <ResponsiveModalContent>
        {trade && <TradeForm key={`${trade.side}-${trade.symbol}`} initial={trade} assets={assets} onDone={() => onOpenChange(false)} />}
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}

function TradeForm({
  initial,
  assets,
  onDone,
}: {
  initial: { side: TradeSide; symbol: CryptoSymbol };
  assets: CryptoAsset[];
  onDone: () => void;
}) {
  const { data: accounts } = useAccounts();
  const placeTrade = usePlaceTrade();
  const checking = accounts?.find((account) => account.type === "checking");

  const form = useForm<TradeValues>({
    resolver: zodResolver(tradeSchema),
    defaultValues: { side: initial.side, symbol: initial.symbol, amount: "" },
    mode: "onTouched",
  });
  const { control, setError, clearErrors } = form;
  const [side, symbol, amountInput] = useWatch({ control, name: ["side", "symbol", "amount"] });
  const asset = assets.find((item) => item.symbol === symbol) ?? assets[0];
  const deferredAmount = useDeferredValue(parseMajorAmount(amountInput ?? ""));
  const quote = useTradeQuote(side, symbol, deferredAmount !== null && deferredAmount >= 1_000 ? deferredAmount : null);

  useEffect(() => clearErrors("root"), [side, symbol, clearErrors]);

  const onSubmit = form.handleSubmit(async (values) => {
    const amount = parseMajorAmount(values.amount);
    if (amount === null || !checking) return;
    try {
      await placeTrade.mutateAsync({ side: values.side, symbol: values.symbol, amount, accountId: checking.id });
      toast.success(`${values.side === "buy" ? "Bought" : "Sold"} ${formatMoney(amount, "USD")} of ${asset.name}`);
      onDone();
    } catch (error) {
      const message =
        error instanceof ApiError ? (error.fieldErrors.amount ?? error.message) : "The trade didn't go through. Try again.";
      setError("amount", { message }, { shouldFocus: true });
    }
  });

  const available = side === "buy" ? (checking?.availableBalance ?? 0) : holdingValue(asset);
  const verb = side === "buy" ? "Buy" : "Sell";

  return (
    <form onSubmit={onSubmit} noValidate className="flex h-full flex-col">
      <ResponsiveModalHeader className="border-b px-6 pt-6 pb-5">
        <ResponsiveModalTitle className="font-heading text-xl">
          {verb} {asset.name}
        </ResponsiveModalTitle>
        <ResponsiveModalDescription>
          {side === "buy" ? `Paid from ${checking?.name ?? "checking"}.` : `Proceeds go to ${checking?.name ?? "checking"}.`}
        </ResponsiveModalDescription>
      </ResponsiveModalHeader>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <FieldGroup>
          <Controller
            name="side"
            control={control}
            render={({ field }) => (
              <Tabs value={field.value} onValueChange={field.onChange}>
                <TabsList className="w-full">
                  <TabsTrigger value="buy">Buy</TabsTrigger>
                  <TabsTrigger value="sell">Sell</TabsTrigger>
                </TabsList>
              </Tabs>
            )}
          />

          <Controller
            name="symbol"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor="trade-symbol">Asset</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="trade-symbol" className="w-full data-[size=default]:h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {assets.map((item) => (
                      <SelectItem key={item.symbol} value={item.symbol}>
                        <CoinIcon symbol={item.symbol} className="size-6 text-xs" />
                        {item.name} · <Money amount={item.price} currency="USD" />
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
          />

          <Controller
            name="amount"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="trade-amount">Amount in USD</FieldLabel>
                <InputGroup className="h-14">
                  <InputGroupAddon>
                    <InputGroupText className="font-heading text-2xl">$</InputGroupText>
                  </InputGroupAddon>
                  <InputGroupInput
                    {...field}
                    id="trade-amount"
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="0.00"
                    autoFocus
                    aria-invalid={fieldState.invalid}
                    onChange={(event) => field.onChange(event.target.value.replace(/[^\d.,]/g, ""))}
                    className="font-heading text-2xl font-semibold tabular-nums md:text-2xl"
                  />
                </InputGroup>
                {!fieldState.invalid && (
                  <FieldDescription>
                    <Money amount={available} currency="USD" sensitive />{" "}
                    {side === "buy" ? "available to spend" : `of ${asset.symbol} available to sell`}
                  </FieldDescription>
                )}
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <dl className="flex flex-col rounded-lg bg-muted/60 px-4 py-1 text-sm" aria-live="polite">
            {[
              ["Price", <Money key="p" amount={asset.price} currency="USD" />],
              [
                side === "buy" ? "You get" : "You sell",
                quote.data ? formatQuantity(quote.data.quantity, asset.symbol) : quote.isFetching ? <Skeleton key="q" className="h-4 w-20" /> : "—",
              ],
              ["Fee", quote.data ? <Money key="f" amount={quote.data.fee} currency="USD" /> : "—"],
              [
                side === "buy" ? "Total cost" : "You receive",
                quote.data ? (
                  <Money key="t" amount={side === "buy" ? quote.data.amount : quote.data.amount - quote.data.fee} currency="USD" className="font-semibold" />
                ) : (
                  "—"
                ),
              ],
            ].map(([label, value]) => (
              <div key={String(label)} className="flex items-center justify-between gap-4 border-b border-dashed py-2.5 last:border-0">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="text-xs text-muted-foreground">
            Prices move quickly. The final amount uses the price at the moment your order fills. Crypto isn&apos;t FDIC insured.
          </p>
        </FieldGroup>
      </div>

      <ResponsiveModalFooter className="border-t px-6 py-4">
        <Button type="submit" size="lg" className="h-11 w-full" disabled={placeTrade.isPending || !checking}>
          {placeTrade.isPending && <Spinner data-icon="inline-start" />}
          {placeTrade.isPending ? "Placing order…" : `${verb} ${asset.symbol}`}
        </Button>
      </ResponsiveModalFooter>
    </form>
  );
}
