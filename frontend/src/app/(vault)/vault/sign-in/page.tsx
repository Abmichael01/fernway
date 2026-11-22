"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, LoaderCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QuickLoginHelper } from "@/components/auth/quick-login-helper";
import { LOCAL_QUICK_SIGN_IN } from "@/config/features";
import { useSignIn } from "@/hooks/auth/useSignIn";
import { type SignInValues, signInSchema } from "@/schemas/auth";
import { ApiError } from "@/api/client";

export default function VaultSignInPage() {
  const router = useRouter();
  const signIn = useSignIn();

  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await signIn.mutateAsync(values);
      router.replace("/vault");
    } catch (error) {
      form.setError("root", {
        message:
          error instanceof ApiError
            ? error.message
            : "Sign-in failed. Please verify your credentials.",
      });
    }
  });

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 antialiased selection:bg-primary selection:text-white">
      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="flex flex-col gap-6 rounded-3xl border border-border/80 bg-card p-6 dark:bg-[#0E121A] sm:p-8">
          {/* Logo & Heading */}
          <div className="flex flex-col items-center text-center">
            <span className="bg-vault-gradient grid size-12 place-items-center rounded-full text-white">
              <ShieldCheck className="size-6" />
            </span>
            <h1 className="mt-4 font-heading text-2xl font-bold tracking-tight text-foreground">
              Fernway <span className="text-primary">Vault</span>
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Self-Custody Multi-Chain Web3 Gateway
            </p>
          </div>

          {/* Local Quick Sign-in */}
          {LOCAL_QUICK_SIGN_IN && <QuickLoginHelper app="vault" />}

          {/* Form */}
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            {form.formState.errors.root && (
              <div className="rounded-xl bg-destructive/10 p-3 text-xs font-medium text-destructive">
                {form.formState.errors.root.message}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Account Email</Label>
              <Controller
                name="email"
                control={form.control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="email"
                    placeholder="name@example.com"
                    autoComplete="email"
                    className="h-11 rounded-xl"
                  />
                )}
              />
              {form.formState.errors.email && (
                <span className="text-[11px] text-destructive">
                  {form.formState.errors.email.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Password</Label>
              <Controller
                name="password"
                control={form.control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="h-11 rounded-xl"
                  />
                )}
              />
              {form.formState.errors.password && (
                <span className="text-[11px] text-destructive">
                  {form.formState.errors.password.message}
                </span>
              )}
            </div>

            <Button
              type="submit"
              disabled={signIn.isPending}
              className="bg-vault-gradient mt-2 h-11 rounded-full font-bold text-white hover:opacity-95"
            >
              {signIn.isPending ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                "Unlock Vault"
              )}
            </Button>
          </form>

          {/* Return to banking link */}
          <div className="border-t border-border/40 pt-4 text-center">
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" />
              <span>Back to Fernway Banking Sign-in</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
