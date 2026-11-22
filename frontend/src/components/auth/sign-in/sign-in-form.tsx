"use client";

import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { ApiError } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useSignIn } from "@/hooks/auth/useSignIn";
import { homeFor } from "@/lib/redirects";
import { type SignInValues, signInSchema } from "@/schemas/auth";

export function SignInForm() {
  const router = useRouter();
  const signIn = useSignIn();
  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
    mode: "onTouched",
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const user = await signIn.mutateAsync(values);
      router.replace(homeFor(user.role, new URLSearchParams(window.location.search).get("next")));
    } catch (error) {
      form.setError("root", {
        message:
          error instanceof ApiError
            ? error.message
            : "We couldn't reach Fernway. Check your connection and try again.",
      });
    }
  });

  return (
    // method="post": if the form is ever submitted before JavaScript loads, the password must not land in the URL.
    <form method="post" onSubmit={onSubmit} noValidate>
      <FieldGroup>
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                {...field}
                id="email"
                type="email"
                autoComplete="email"
                aria-invalid={fieldState.invalid}
                className="h-11"
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                {...field}
                id="password"
                type="password"
                autoComplete="current-password"
                aria-invalid={fieldState.invalid}
                className="h-11"
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        {form.formState.errors.root && (
          <p role="alert" className="text-sm text-destructive">
            {form.formState.errors.root.message}
          </p>
        )}
        <Button type="submit" size="lg" className="h-11 w-full" disabled={signIn.isPending}>
          {signIn.isPending && <LoaderCircle className="animate-spin" data-icon="inline-start" />}
          {signIn.isPending ? "Signing in…" : "Sign in"}
        </Button>
      </FieldGroup>
    </form>
  );
}
