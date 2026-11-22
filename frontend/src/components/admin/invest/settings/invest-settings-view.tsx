"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Info, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { ApiError } from "@/api/client";
import { applyFieldErrors, SwitchField, TextField } from "@/components/admin/shared/form-fields";
import { PageHeader } from "@/components/shared/page-header";
import { QueryError } from "@/components/shared/query-states";
import { Button } from "@/components/ui/button";
import { FieldGroup, FieldLegend, FieldSet } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { useInvestSettings } from "@/hooks/admin-invest/useInvestSettings";
import { useUpdateInvestSettings } from "@/hooks/admin-invest/useUpdateInvestSettings";
import { addressHint, COIN_NETWORKS, CRYPTO_NAMES, CRYPTO_SYMBOLS } from "@/lib/invest";
import { type InvestSettingsInput, investSettingsSchema } from "@/schemas/invest";
import type { InvestSettings } from "@/types/invest";

const valuesFrom = (settings: InvestSettings): InvestSettingsInput => ({
  depositsOpen: settings.depositsOpen,
  addresses: { ...settings.addresses },
});

function SettingsForm({ settings }: { settings: InvestSettings }) {
  const update = useUpdateInvestSettings();
  const form = useForm<InvestSettingsInput>({ resolver: zodResolver(investSettingsSchema), defaultValues: valuesFrom(settings) });
  const { reset } = form;
  useEffect(() => reset(valuesFrom(settings)), [settings, reset]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await update.mutateAsync(values);
      toast.success("Settings saved");
    } catch (error) {
      if (error instanceof ApiError) applyFieldErrors(form.setError, error.fieldErrors, error.message);
      else form.setError("root", { message: "We couldn't reach the server. Try again." });
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex max-w-2xl flex-col gap-8">
      <SwitchField
        control={form.control}
        name="depositsOpen"
        label="Deposits open"
        description="When off, customers can't create deposit addresses or deposit."
      />

      <FieldSet>
        <FieldLegend>Company wallets</FieldLegend>
        <FieldGroup className="gap-5">
          {CRYPTO_SYMBOLS.map((symbol) => (
            <TextField
              key={symbol}
              control={form.control}
              name={`addresses.${symbol}`}
              label={`${CRYPTO_NAMES[symbol]} (${symbol}) · ${COIN_NETWORKS[symbol].network}`}
              placeholder={addressHint(symbol)}
              description="Company wallet that receives this coin. CryptAPI forwards each deposit here."
            />
          ))}
        </FieldGroup>
      </FieldSet>

      {form.formState.errors.root && (
        <p role="alert" className="text-sm text-destructive">
          {form.formState.errors.root.message}
        </p>
      )}
      <Button type="submit" size="lg" className="self-start" disabled={update.isPending}>
        {update.isPending && <Spinner data-icon="inline-start" />}
        Save settings
      </Button>
    </form>
  );
}

export function InvestSettingsView() {
  const { data, isPending, isError, refetch } = useInvestSettings();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Invest settings" description="Deposits and the company wallets that receive them." />

      {isError ? (
        <QueryError message="We couldn't load the settings." onRetry={() => void refetch()} />
      ) : isPending ? (
        <div className="flex max-w-2xl flex-col gap-4" aria-hidden="true">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <>
          <div className="max-w-2xl rounded-md border p-4 text-sm">
            <p className="text-xs font-medium text-muted-foreground">Callback address (INVEST_PUBLIC_URL)</p>
            {data.callbackBaseUrl ? (
              <p className="mt-1 font-mono break-all">{data.callbackBaseUrl}</p>
            ) : (
              <p role="alert" className="mt-1 flex gap-2 text-pending">
                <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                INVEST_PUBLIC_URL must be set on the server before deposits can work.
              </p>
            )}
          </div>

          <div className="flex max-w-2xl gap-3 rounded-md bg-muted/60 p-4 text-sm">
            <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <div className="flex flex-col gap-2">
              <p className="font-medium">Before opening deposits</p>
              <ol className="list-decimal space-y-1 pl-5 text-muted-foreground">
                <li>Set INVEST_PUBLIC_URL to the public https address of this app.</li>
                <li>Verify that domain at cryptapi.io (Verify domain).</li>
                <li>Enter the company wallet for each coin you accept.</li>
              </ol>
              <p className="text-muted-foreground">
                Updating a receiving address automatically refreshes payment addresses for that coin. Leaving an address empty
                disables deposits for that coin.
              </p>
            </div>
          </div>

          <SettingsForm settings={data} />
        </>
      )}
    </div>
  );
}
