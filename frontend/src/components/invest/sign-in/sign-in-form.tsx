"use client";

import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiError } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { safeInvestNext } from "@/config/invest";
import { useInvestSignIn } from "@/hooks/invest/useInvestSignIn";
import { type InvestSignInValues, investSignInSchema } from "@/schemas/invest";

export function InvestSignInForm() {
  const router = useRouter();
  const signIn = useInvestSignIn();
  const form = useForm<InvestSignInValues>({
    resolver: zodResolver(investSignInSchema),
    defaultValues: { email: "", password: "" },
    mode: "onTouched",
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await signIn.mutateAsync(values);
      router.replace(safeInvestNext(new URLSearchParams(window.location.search).get("next")));
    } catch (error) {
      if (error instanceof ApiError) {
        const { email, password } = error.fieldErrors;
        if (email) form.setError("email", { message: email });
        if (password) form.setError("password", { message: password });
        if (!email && !password) form.setError("root", { message: error.message });
      } else {
        form.setError("root", { message: "We couldn't reach Lindenway Invest. Check your connection and try again." });
      }
    }
  });

  const rootError = form.formState.errors.root?.message;

  return (
    // method="post": if the form is ever submitted before JavaScript loads, the password must not land in the URL.
    <form method="post" onSubmit={onSubmit} noValidate>
      <FieldGroup>
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="invest-email">Email</FieldLabel>
              <Input {...field} id="invest-email" type="email" autoComplete="email" aria-invalid={fieldState.invalid} className="h-11" />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="invest-password">Password</FieldLabel>
              <Input
                {...field}
                id="invest-password"
                type="password"
                autoComplete="current-password"
                aria-invalid={fieldState.invalid}
                className="h-11"
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        {rootError && (
          <p role="alert" className="text-sm text-debit">
            {rootError}
          </p>
        )}
        <Button type="submit" size="lg" disabled={form.formState.isSubmitting} className="h-11 w-full">
          {form.formState.isSubmitting && <Spinner data-icon="inline-start" />}
          Sign in
        </Button>
      </FieldGroup>
    </form>
  );
}
