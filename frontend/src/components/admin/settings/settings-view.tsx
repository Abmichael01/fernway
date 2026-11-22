"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import { ApiError } from "@/api/client";
import { applyFieldErrors, TextField } from "@/components/admin/shared/form-fields";
import { PageHeader } from "@/components/shared/page-header";
import { QueryError } from "@/components/shared/query-states";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { useSiteSettings, useUpdateSiteSettings } from "@/hooks/settings/useSiteSettings";
import { type SiteSettingsValues, siteSettingsSchema } from "@/schemas/settings";

export function SettingsView() {
  const { data: settings, isPending, isError, refetch } = useSiteSettings();
  const update = useUpdateSiteSettings();
  const form = useForm<SiteSettingsValues>({
    resolver: zodResolver(siteSettingsSchema),
    defaultValues: { supportEmail: "" },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
  const { reset } = form;

  useEffect(() => {
    if (settings) reset({ supportEmail: settings.supportEmail ?? "" });
  }, [settings, reset]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const saved = await update.mutateAsync(values);
      reset({ supportEmail: saved.supportEmail ?? "" });
      toast.success(saved.supportEmail ? `Support email set to ${saved.supportEmail}` : "Support email removed from the site");
    } catch (error) {
      if (error instanceof ApiError) applyFieldErrors(form.setError, error.fieldErrors, error.message);
      else form.setError("root", { message: "We couldn't reach the server. Try again." });
    }
  });

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Settings" description="What visitors and customers see on the website and in the app." />

      {isError ? (
        <QueryError message="We couldn't load the settings." onRetry={() => void refetch()} />
      ) : (
        <form onSubmit={onSubmit} noValidate className="flex max-w-2xl flex-col gap-6 rounded-md border p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="bg-brand-gradient grid size-9 place-items-center rounded-full text-white">
              <Mail className="size-4" aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-heading font-semibold">Support email</h2>
              <p className="text-sm text-muted-foreground">
                Shown on every Contact button, the website footer and top bar, and Help &amp; support in the app.
              </p>
            </div>
          </div>
          {isPending ? (
            <Skeleton className="h-[72px] w-full" />
          ) : (
            <TextField
              control={form.control}
              name="supportEmail"
              label="Email address"
              type="email"
              placeholder="support@yourcompany.com"
              description="Use an inbox someone reads. Leave it empty to hide all contact links."
            />
          )}
          {form.formState.errors.root && (
            <p role="alert" className="text-sm text-destructive">
              {form.formState.errors.root.message}
            </p>
          )}
          <div>
            <Button type="submit" size="lg" disabled={isPending || update.isPending || !form.formState.isDirty}>
              {update.isPending && <Spinner data-icon="inline-start" />}
              {update.isPending ? "Saving…" : "Save settings"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
