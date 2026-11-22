"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowRight, LoaderCircle, ShieldCheck, User, Zap } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { quickLogin } from "@/api/auth";
import { homeFor } from "@/lib/redirects";
import { queryKeys } from "@/hooks/query-keys";

interface QuickLoginHelperProps {
  app?: "banking" | "vault";
  onFillCredentials?: (email: string) => void;
}

const LOCAL_ACCOUNTS = [
  {
    role: "admin" as const,
    name: "Fernway Admin",
    email: "admin@fernway.dev",
    description: "Full control over customers, accounts, cards & vault",
    icon: ShieldCheck,
    badgeText: "Admin",
    badgeColor: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  },
  {
    role: "customer" as const,
    name: "Michael Oyekola",
    email: "urkelcodes7@gmail.com",
    description: "Checking, savings, transactions & multi-chain vault",
    icon: User,
    badgeText: "Customer",
    badgeColor: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  },
];

export function QuickLoginHelper({ app = "banking" }: QuickLoginHelperProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loadingEmail, setLoadingEmail] = useState<string | null>(null);

  const handleQuickSignIn = async (email: string, role: "admin" | "customer", name: string) => {
    try {
      setLoadingEmail(email);
      const user = await quickLogin(email);

      await queryClient.invalidateQueries({ queryKey: queryKeys.currentUser });

      toast.success(`Signed in as ${name}`);

      if (app === "vault") {
        router.replace("/vault");
      } else {
        const nextUrl = new URLSearchParams(window.location.search).get("next");
        router.replace(homeFor(user.role, nextUrl));
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to sign in.");
      setLoadingEmail(null);
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-muted/40 p-4">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
          <Zap className="size-3.5 text-primary fill-primary/20" />
          <span>Quick Sign-In</span>
        </span>
        <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
          This computer only
        </Badge>
      </div>

      <p className="text-[11px] text-muted-foreground leading-relaxed">
        Click any account below to sign in instantly:
      </p>

      <div className="grid gap-2">
        {LOCAL_ACCOUNTS.map((acc) => {
          const Icon = acc.icon;
          const isLoading = loadingEmail === acc.email;

          return (
            <button
              key={acc.email}
              type="button"
              disabled={Boolean(loadingEmail)}
              onClick={() => handleQuickSignIn(acc.email, acc.role, acc.name)}
              className="group flex items-center justify-between rounded-xl border border-border/70 bg-card p-3 text-left transition-all hover:border-primary hover:bg-muted/30 hover:shadow-xs active:scale-[0.99] disabled:opacity-60"
            >
              <div className="flex items-center gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-foreground group-hover:bg-primary group-hover:text-white transition-colors">
                  {isLoading ? <LoaderCircle className="size-4 animate-spin" /> : <Icon className="size-4" />}
                </span>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground">{acc.name}</span>
                    <Badge variant="outline" className={`h-4 px-1 text-[10px] ${acc.badgeColor}`}>
                      {acc.badgeText}
                    </Badge>
                  </div>
                  <span className="text-[11px] font-mono text-muted-foreground">{acc.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Enter</span>
                <ArrowRight className="size-3.5" />
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2 pt-1 text-muted-foreground">
        <div className="h-px flex-1 bg-border/60" />
        <span className="text-[10px] uppercase font-medium tracking-wider">or sign in manually</span>
        <div className="h-px flex-1 bg-border/60" />
      </div>
    </div>
  );
}
