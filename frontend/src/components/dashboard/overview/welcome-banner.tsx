"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { CreditCard, Eye, EyeOff, PiggyBank, Plus, Send } from "lucide-react";
import { MoneyFigure } from "@/components/shared/money";
import { QueryError } from "@/components/shared/query-states";
import { TrianglePattern } from "@/components/shared/triangle-pattern";
import { Skeleton } from "@/components/ui/skeleton";
import { siteConfig } from "@/config/site";
import { useAccounts } from "@/hooks/accounts/useAccounts";
import { useCurrentUser } from "@/hooks/users/useCurrentUser";
import { usePreferences } from "@/stores/user/preferences";
import { AddMoneyDialog } from "./add-money-dialog";

function greetingFor(date: Date): string {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

/** Phones: round icon buttons in one row, like a banking app. Larger screens: rounded tiles. */
const actionClass =
  "group flex flex-col items-center gap-2 text-center font-dm text-xs font-medium whitespace-nowrap text-white outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:rounded-xl sm:border sm:border-white/15 sm:bg-white/10 sm:px-4 sm:py-4 sm:text-sm sm:backdrop-blur-sm sm:transition-colors sm:hover:bg-white sm:hover:text-ember";

function ActionIcon({ children }: { children: ReactNode }) {
  return (
    <span className="grid size-13 place-items-center rounded-full bg-white/15 ring-1 ring-white/20 transition-transform active:scale-95 sm:size-auto sm:rounded-none sm:bg-transparent sm:ring-0">
      {children}
    </span>
  );
}

export function WelcomeBanner() {
  const { data: user } = useCurrentUser();
  const { data: accounts, isPending, isError, refetch } = useAccounts();
  const hideBalances = usePreferences((state) => state.hideBalances);
  const toggleHideBalances = usePreferences((state) => state.toggleHideBalances);

  const cash = accounts?.reduce((sum, account) => sum + account.balance, 0) ?? 0;
  const primaryAccount = accounts?.find((account) => account.type === "checking") ?? accounts?.[0];
  const hasMultipleAccounts = (accounts?.length ?? 0) > 1;

  return (
    <section aria-labelledby="welcome-heading" className="bg-brand-gradient relative isolate overflow-hidden rounded-2xl text-white">
      <TrianglePattern className="absolute inset-y-0 right-0 -z-10 h-full w-[55%] opacity-40 mix-blend-soft-light" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ember/40 to-transparent" />

      <div className="grid gap-7 p-5 sm:gap-8 sm:p-8 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
        <div>
          {user ? (
            <>
              <h1 id="welcome-heading" className="font-dm text-xl font-medium sm:text-3xl">
                {greetingFor(new Date())}, {user.firstName}
              </h1>
              <p className="mt-1 text-sm text-white/75">
                {new Date().toLocaleDateString(siteConfig.locale, { weekday: "long", month: "long", day: "numeric" })}
              </p>
            </>
          ) : (
            <>
              <Skeleton className="h-8 w-64 bg-white/15" />
              <Skeleton className="mt-2 h-4 w-40 bg-white/15" />
            </>
          )}

          <div className="mt-6 flex items-center gap-2 text-sm text-white/80 sm:mt-8">
            Account balance
            <button
              type="button"
              onClick={toggleHideBalances}
              aria-pressed={hideBalances}
              aria-label={hideBalances ? "Show balance" : "Hide balance"}
              className="grid size-7 place-items-center rounded-lg text-white/80 transition-colors hover:bg-white/15 hover:text-white"
            >
              {hideBalances ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          <div className="mt-1 min-h-14">
            {isError ? (
              <QueryError message="We couldn't load your balance." onRetry={() => void refetch()} className="border-white/30 text-white" />
            ) : isPending ? (
              <Skeleton className="h-14 w-72 bg-white/15" />
            ) : (
              <MoneyFigure amount={cash} currency={siteConfig.defaultCurrency} className="font-dm text-[2.6rem] leading-none font-medium sm:text-6xl" />
            )}
          </div>
        </div>

        <nav
          aria-label="Quick actions"
          className={hasMultipleAccounts ? "grid grid-cols-4 gap-2 xl:w-[520px]" : "grid grid-cols-3 gap-2.5 xl:w-[400px]"}
        >
          <Link href="/transfers" className={actionClass}>
            <ActionIcon><Send className="size-5 text-amber group-hover:text-flame" aria-hidden="true" /></ActionIcon>
            Send money
          </Link>
          {primaryAccount ? (
            <AddMoneyDialog account={primaryAccount}>
              <button type="button" className={actionClass}>
                <ActionIcon><Plus className="size-5 text-amber group-hover:text-flame" aria-hidden="true" /></ActionIcon>
                Add money
              </button>
            </AddMoneyDialog>
          ) : (
            <span className={actionClass}>
              <ActionIcon><Plus className="size-5 text-amber" aria-hidden="true" /></ActionIcon>
              Add money
            </span>
          )}
          {hasMultipleAccounts && (
            <Link href="/transfers?tab=between" className={actionClass}>
              <ActionIcon><PiggyBank className="size-5 text-amber group-hover:text-flame" aria-hidden="true" /></ActionIcon>
              Save
            </Link>
          )}
          <Link href="/cards" className={actionClass}>
            <ActionIcon><CreditCard className="size-5 text-amber group-hover:text-flame" aria-hidden="true" /></ActionIcon>
            Cards
          </Link>
        </nav>
      </div>
    </section>
  );
}
