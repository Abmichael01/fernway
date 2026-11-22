"use client";

import { ImagePlus, X } from "lucide-react";
import { type ChangeEvent, type ReactNode, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { z } from "zod";
import { ApiError } from "@/api/client";
import { applyFieldErrors, SelectField, SwitchField, TextField } from "@/components/admin/shared/form-fields";
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
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useCreatePortfolio } from "@/hooks/admin-invest/useCreatePortfolio";
import { useUpdatePortfolio } from "@/hooks/admin-invest/useUpdatePortfolio";
import { RISK_LABELS, RISKS } from "@/lib/invest";
import { type AdminPortfolioInput, adminPortfolioSchema } from "@/schemas/invest";
import type { AdminPortfolio } from "@/types/invest";

type FormInput = z.input<typeof adminPortfolioSchema>;

const emptyValues: FormInput = {
  name: "",
  summary: "",
  description: "",
  imageUrl: "",
  risk: "balanced",
  autoDailyEnabled: false,
  dailyRateBps: 0,
  dailyFixedCents: 0,
  allocations: [{ symbol: "USDC", weightBps: 10_000 }],
  published: false,
};

const valuesFrom = (portfolio?: AdminPortfolio): FormInput =>
  portfolio
    ? {
        name: portfolio.name,
        summary: portfolio.summary,
        description: portfolio.description,
        imageUrl: portfolio.imageUrl ?? "",
        risk: portfolio.risk,
        autoDailyEnabled: portfolio.autoDailyEnabled ?? false,
        dailyRateBps: portfolio.dailyRateBps ?? 0,
        dailyFixedCents: portfolio.dailyFixedCents ?? 0,
        allocations: portfolio.allocations.length > 0 ? portfolio.allocations.map((item) => ({ ...item })) : [{ symbol: "USDC", weightBps: 10_000 }],
        published: portfolio.published,
      }
    : emptyValues;

const riskOptions = RISKS.map((risk) => ({ value: risk, label: RISK_LABELS[risk] }));

interface Props {
  /** Omit to create a new portfolio. */
  portfolio?: AdminPortfolio;
  children: ReactNode;
}

export function PortfolioFormModal({ portfolio, children }: Props) {
  const [open, setOpen] = useState(false);
  const create = useCreatePortfolio();
  const update = useUpdatePortfolio(portfolio?.id ?? "");
  const pending = create.isPending || update.isPending;
  const form = useForm<FormInput, unknown, AdminPortfolioInput>({
    resolver: zodResolver(adminPortfolioSchema),
    defaultValues: valuesFrom(portfolio),
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      if (portfolio) await update.mutateAsync(values);
      else await create.mutateAsync(values);
      toast.success(portfolio ? "Portfolio saved" : "Portfolio created");
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
        if (next) form.reset(valuesFrom(portfolio));
      }}
      desktop="sheet"
      dismissible={!pending}
    >
      <ResponsiveModalTrigger asChild>{children}</ResponsiveModalTrigger>
      <ResponsiveModalContent className="sm:max-w-lg">
        <ResponsiveModalHeader className="border-b px-6 pt-6 pb-5">
          <ResponsiveModalTitle className="font-heading text-xl">{portfolio ? "Edit offering" : "New offering"}</ResponsiveModalTitle>
          <ResponsiveModalDescription>
            {portfolio
              ? "Update this investment offering's details and cover picture."
              : "Create an investment offering with a cover picture. Customers can invest in USD and pay via BEP-20 crypto."}
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>
        <form onSubmit={onSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <FieldGroup className="gap-5">
              <TextField control={form.control} name="name" label="Name" />
              <TextField control={form.control} name="summary" label="Summary" description="One line shown on the offering card." />
              <Controller
                control={form.control}
                name="imageUrl"
                render={({ field, fieldState }) => {
                  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    if (file.size > 350_000) {
                      toast.error("Please choose an image under 350 KB or paste an image URL.");
                      return;
                    }
                    const reader = new FileReader();
                    reader.onload = () => {
                      if (typeof reader.result === "string") field.onChange(reader.result);
                    };
                    reader.readAsDataURL(file);
                  };
                  return (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="portfolio-image">Picture</FieldLabel>
                      <div className="flex flex-col gap-3">
                        {field.value ? (
                          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg border bg-muted">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={field.value} alt="Offering preview" className="h-full w-full object-cover" />
                            <Button
                              type="button"
                              variant="secondary"
                              size="icon"
                              aria-label="Remove picture"
                              onClick={() => field.onChange("")}
                              className="absolute top-2 right-2 size-7 rounded-full"
                            >
                              <X className="size-3.5" />
                            </Button>
                          </div>
                        ) : null}
                        <div className="flex items-center gap-2">
                          <Input
                            {...field}
                            value={field.value ?? ""}
                            id="portfolio-image"
                            placeholder="https://images.unsplash.com/..."
                            aria-invalid={fieldState.invalid}
                          />
                          <label className="inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-md border bg-background px-3 text-sm font-medium hover:bg-muted">
                            <ImagePlus className="size-4" />
                            Upload
                            <input type="file" accept="image/*" className="sr-only" onChange={handleFile} />
                          </label>
                        </div>
                      </div>
                      <FieldDescription>Paste an image URL or upload a photo (under 350 KB).</FieldDescription>
                      <FieldError errors={[fieldState.error]} />
                    </Field>
                  );
                }}
              />
              <Controller
                control={form.control}
                name="description"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="portfolio-description">Description</FieldLabel>
                    <Textarea {...field} value={field.value ?? ""} id="portfolio-description" rows={4} aria-invalid={fieldState.invalid} />
                    <FieldDescription>Describe the investment offering, asset, or strategy.</FieldDescription>
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
              <SelectField control={form.control} name="risk" label="Risk" options={riskOptions} />
              <SwitchField
                control={form.control}
                name="autoDailyEnabled"
                label="Auto daily earning"
                description="Automatically credit investors each day using the fixed amount or percentage below, regardless of actual admin returns."
              />
              {form.watch("autoDailyEnabled") && (
                <div className="grid gap-4 rounded-lg border bg-muted/40 p-4 sm:grid-cols-2">
                  <Controller
                    control={form.control}
                    name="dailyFixedCents"
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="daily-fixed-usd">Fixed daily amount ($)</FieldLabel>
                        <Input
                          id="daily-fixed-usd"
                          type="number"
                          min={0}
                          step="0.01"
                          value={((field.value ?? 0) / 100).toString()}
                          onChange={(e) => {
                            const val = Number.parseFloat(e.target.value);
                            field.onChange(Number.isFinite(val) && val >= 0 ? Math.round(val * 100) : 0);
                          }}
                        />
                        <FieldDescription>Flat USD credited per day.</FieldDescription>
                        <FieldError errors={[fieldState.error]} />
                      </Field>
                    )}
                  />
                  <Controller
                    control={form.control}
                    name="dailyRateBps"
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="daily-rate-pct">Daily rate (%)</FieldLabel>
                        <Input
                          id="daily-rate-pct"
                          type="number"
                          min={0}
                          step="0.01"
                          value={((field.value ?? 0) / 100).toString()}
                          onChange={(e) => {
                            const val = Number.parseFloat(e.target.value);
                            field.onChange(Number.isFinite(val) && val >= 0 ? Math.round(val * 100) : 0);
                          }}
                        />
                        <FieldDescription>% of invested principal per day.</FieldDescription>
                        <FieldError errors={[fieldState.error]} />
                      </Field>
                    )}
                  />
                </div>
              )}
              <SwitchField
                control={form.control}
                name="published"
                label="Published"
                description="Published offerings are visible to customers. Drafts are not."
              />
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
              {portfolio ? "Save offering" : "Create offering"}
            </Button>
          </ResponsiveModalFooter>
        </form>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
