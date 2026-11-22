"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowRight, LoaderCircle, User, Zap } from "lucide-react";
import { toast } from "sonner";
import { investQuickLogin } from "@/api/invest";
import { Badge } from "@/components/ui/badge";
import { safeInvestNext } from "@/config/invest";
import { investKeys } from "@/hooks/invest/keys";

const INVEST_LOCAL_ACCOUNTS = [
  {
    name: "Michael Oyekola",
    email: "urkelcodes7@gmail.com",
    description: "Managed portfolios, direct crypto & cash ledger",
  },
];

export function InvestQuickLoginHelper() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loadingEmail, setLoadingEmail] = useState<string | null>(null);

  const handleQuickSignIn = async (email: string, name: string) => {
    try {
      setLoadingEmail(email);
      await investQuickLogin(email);
      await queryClient.invalidateQueries({ queryKey: investKeys.me });
      toast.success(`Signed in as ${name}`);
      const nextUrl = new URLSearchParams(window.location.search).get("next");
      router.replace(safeInvestNext(nextUrl));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to sign in.");
      setLoadingEmail(null);
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-muted/40 p-4">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
          <Zap className="size-3.5 fill-primary/20 text-primary" />
          <span>Quick Sign-In</span>
        </span>
        <Badge variant="outline" className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
          This computer only
        </Badge>
      </div>

      <p className="text-[11px] leading-relaxed text-muted-foreground">Click an investor account below to sign in instantly:</p>

      <div className="grid gap-2">
        {INVEST_LOCAL_ACCOUNTS.map((acc) => {
          const isLoading = loadingEmail === acc.email;
          return (
            <button
              key={acc.email}
              type="button"
              disabled={Boolean(loadingEmail)}
              onClick={() => handleQuickSignIn(acc.email, acc.name)}
              className="group flex items-center justify-between rounded-xl border border-border/70 bg-card p-3 text-left transition-all hover:border-primary hover:bg-muted/30 hover:shadow-xs active:scale-[0.99] disabled:opacity-60"
            >
              <div className="flex items-center gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-foreground transition-colors group-hover:bg-primary group-hover:text-white">
                  {isLoading ? <LoaderCircle className="size-4 animate-spin" /> : <User className="size-4" />}
                </span>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground">{acc.name}</span>
                    <Badge
                      variant="outline"
                      className="h-4 border-emerald-500/30 bg-emerald-500/15 px-1 text-[10px] text-emerald-600 dark:text-emerald-400"
                    >
                      Investor
                    </Badge>
                  </div>
                  <span className="font-mono text-[11px] text-muted-foreground">{acc.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
                <span>Enter</span>
                <ArrowRight className="size-3.5" />
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2 pt-1 text-muted-foreground">
        <div className="h-px flex-1 bg-border/60" />
        <span className="text-[10px] font-medium tracking-wider uppercase">or sign in manually</span>
        <div className="h-px flex-1 bg-border/60" />
      </div>
    </div>
  );
}
