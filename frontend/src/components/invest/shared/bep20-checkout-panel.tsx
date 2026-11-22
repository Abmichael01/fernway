"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, QrCode } from "lucide-react";
import QRCode from "qrcode";
import { toast } from "sonner";
import { ApiError } from "@/api/client";
import { CopyButton } from "@/components/shared/copy-button";
import { ResponsiveModalFooter } from "@/components/shared/responsive-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { useCreateInvestCheckout } from "@/hooks/invest/useCreateInvestCheckout";
import { MAX_TRADE, MIN_TRADE } from "@/lib/invest";
import { formatMoney, parseMajorAmount } from "@/lib/money";
import type { InvestCheckout } from "@/types/invest";

const PRESETS = [100, 500, 1000, 5000];

interface Bep20CheckoutPanelProps {
  description: string;
  submitLabel: string;
  onDone: () => void;
}

export function Bep20CheckoutPanel({ description, submitLabel, onDone }: Bep20CheckoutPanelProps) {
  const [amountInput, setAmountInput] = useState("500");
  const [error, setError] = useState<string | null>(null);
  const [checkout, setCheckout] = useState<InvestCheckout | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const createCheckout = useCreateInvestCheckout();

  useEffect(() => {
    if (!checkout?.addressIn) return;
    let cancelled = false;
    QRCode.toDataURL(checkout.addressIn, { margin: 1, width: 220 })
      .then((url) => !cancelled && setQrUrl(url))
      .catch(() => !cancelled && setQrUrl(null));
    return () => {
      cancelled = true;
    };
  }, [checkout?.addressIn]);

  async function handleContinue(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const cents = parseMajorAmount(amountInput);
    if (cents === null || cents < MIN_TRADE) {
      setError(`Enter at least ${formatMoney(MIN_TRADE, "USD")}.`);
      return;
    }
    if (cents > MAX_TRADE) {
      setError(`Maximum single payment is ${formatMoney(MAX_TRADE, "USD")}.`);
      return;
    }
    try {
      const res = await createCheckout.mutateAsync({ amount: cents, description });
      setCheckout(res);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not generate BEP-20 payment address.");
    }
  }

  if (checkout) {
    const feePct = (checkout.feeRate * 100).toLocaleString("en-US", { maximumFractionDigits: 2 });
    return (
      <div className="flex flex-col">
        <div className="flex flex-col gap-4 px-6 py-5">
          <div className="flex items-center justify-between gap-2 rounded-lg border bg-muted/40 p-3">
            <div>
              <p className="text-xs text-muted-foreground">Amount to send</p>
              <p className="font-heading text-xl font-bold tabular-nums">{checkout.amountCoin} USDC</p>
            </div>
            <Badge variant="outline" className="font-semibold">
              {checkout.network}
            </Badge>
          </div>

          <div className="flex flex-col items-center gap-3 rounded-lg border bg-card p-4">
            {qrUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrUrl}
                alt="BEP-20 payment QR code"
                width={168}
                height={168}
                className="size-[168px] rounded-md border bg-white p-1.5"
              />
            ) : (
              <div className="grid size-[168px] place-items-center rounded-md border bg-muted">
                <QrCode className="size-8 text-muted-foreground" />
              </div>
            )}
            <div className="w-full space-y-1.5">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Send USDC (BEP-20) to this address
              </p>
              <p className="rounded-md border bg-muted/50 p-2.5 font-mono text-xs break-all select-all">
                {checkout.addressIn}
              </p>
              <CopyButton value={checkout.addressIn} label="BEP-20 address" withText variant="outline" className="w-full" />
            </div>
          </div>

          <ul className="flex list-disc flex-col gap-1 pl-5 text-xs text-muted-foreground">
            <li>Send only USD stablecoin (USDC) on <strong>{checkout.network}</strong>.</li>
            <li>Gateway fee: ~{feePct}% · Minimum: {checkout.minimum} USDC.</li>
            <li>Your investment is credited automatically once confirmed on-chain.</li>
          </ul>
        </div>

        <ResponsiveModalFooter className="border-t bg-muted/20 px-6 py-4 flex-row gap-2">
          <Button type="button" variant="outline" onClick={() => setCheckout(null)} className="gap-1.5">
            <ArrowLeft className="size-3.5" />
            Back
          </Button>
          <Button
            type="button"
            className="flex-1 gap-1.5"
            onClick={() => {
              toast.success("BEP-20 payment details recorded. Waiting for confirmation.");
              onDone();
            }}
          >
            <CheckCircle2 className="size-4" />
            I&apos;ve sent {checkout.amountCoin} USDC
          </Button>
        </ResponsiveModalFooter>
      </div>
    );
  }

  return (
    <form onSubmit={handleContinue} noValidate className="flex flex-col">
      <div className="flex flex-col gap-4 px-6 py-5">
        <Field data-invalid={Boolean(error)}>
          <FieldLabel htmlFor="bep20-amount">Amount in USD (paid via BEP-20)</FieldLabel>
          <InputGroup className="h-14">
            <InputGroupAddon>
              <InputGroupText className="font-heading text-2xl">$</InputGroupText>
            </InputGroupAddon>
            <InputGroupInput
              id="bep20-amount"
              inputMode="decimal"
              autoComplete="off"
              placeholder="0.00"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value.replace(/[^\d.,]/g, ""))}
              aria-invalid={Boolean(error)}
              className="font-heading text-2xl font-semibold tabular-nums md:text-2xl"
            />
          </InputGroup>
          <FieldDescription>Paid in USD (USDC) on BNB Smart Chain (BEP-20) via CryptAPI.</FieldDescription>
          {error && <FieldError errors={[{ message: error }]} />}
        </Field>

        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <Button
              key={preset}
              type="button"
              variant={amountInput === String(preset) ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setAmountInput(String(preset));
                setError(null);
              }}
            >
              ${preset.toLocaleString("en-US")}
            </Button>
          ))}
        </div>
      </div>

      <ResponsiveModalFooter className="border-t bg-muted/20 px-6 py-4">
        <Button type="submit" size="lg" className="w-full" disabled={createCheckout.isPending}>
          {createCheckout.isPending && <Spinner data-icon="inline-start" />}
          {submitLabel} · Pay via BEP-20
        </Button>
      </ResponsiveModalFooter>
    </form>
  );
}
