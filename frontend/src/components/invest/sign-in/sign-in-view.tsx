import Link from "next/link";
import { Guilloche } from "@/components/shared/guilloche";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { LOCAL_QUICK_SIGN_IN } from "@/config/features";
import { investConfig } from "@/config/invest";
import { InvestBrand } from "../shell/invest-brand";
import { InvestQuickLoginHelper } from "./invest-quick-login-helper";
import { InvestSignInForm } from "./sign-in-form";

export function InvestSignInView() {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <aside className="relative isolate hidden overflow-hidden bg-brand p-10 text-brand-foreground lg:flex lg:flex-col lg:justify-between">
        <Guilloche
          variant="plate"
          animated
          className="absolute top-1/2 left-1/2 -z-10 size-[46rem] -translate-x-1/2 -translate-y-1/2 text-brass opacity-80"
        />
        <InvestBrand />
        <p className="max-w-sm font-heading text-3xl leading-tight font-bold tracking-tight">
          Managed crypto portfolios and direct crypto, in one place.
        </p>
      </aside>
      <div className="flex flex-col">
        <div className="flex items-center justify-between p-4 sm:p-6">
          <Link href={investConfig.signInPath} className="rounded-md text-primary outline-none focus-visible:ring-2 focus-visible:ring-ring lg:invisible dark:text-foreground">
            <InvestBrand />
          </Link>
          <ThemeToggle />
        </div>
        <main className="flex flex-1 items-center justify-center px-4 pb-10 sm:px-6">
          <div className="flex w-full max-w-sm flex-col gap-8">
            <div className="flex flex-col gap-2">
              <h1 className="font-heading text-2xl font-bold tracking-tight">Sign in to Lindenway Invest</h1>
              <p className="text-sm text-muted-foreground">
                Lindenway Invest is invitation only. Your account is set up by the Lindenway team.
              </p>
            </div>
            {LOCAL_QUICK_SIGN_IN && <InvestQuickLoginHelper />}
            <InvestSignInForm />
          </div>
        </main>
      </div>
    </div>
  );
}
