import type { Metadata } from "next";
import { SecurityAdvisoryDialog } from "@/components/auth/sign-in/security-advisory-dialog";
import { SignInForm } from "@/components/auth/sign-in/sign-in-form";
import { QuickLoginHelper } from "@/components/auth/quick-login-helper";
import { LOCAL_QUICK_SIGN_IN } from "@/config/features";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <>
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-bold tracking-tight">Sign in</h1>
        <p className="text-sm text-muted-foreground">Use the email and password on your {siteConfig.name} account.</p>
      </div>
      {LOCAL_QUICK_SIGN_IN && <QuickLoginHelper app="banking" />}
      <SignInForm />
      <SecurityAdvisoryDialog />
    </>
  );
}
