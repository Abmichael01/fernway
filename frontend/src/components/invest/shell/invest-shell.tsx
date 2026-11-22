"use client";

import { type ReactNode, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ApiError } from "@/api/client";
import { QueryError } from "@/components/shared/query-states";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { investConfig } from "@/config/invest";
import { useInvestMe } from "@/hooks/invest/useInvestMe";
import { InvestBrand } from "./invest-brand";
import { InvestCurrentTitle } from "./invest-current-title";
import { InvestMobileNav } from "./invest-mobile-nav";
import { InvestSidebar } from "./invest-sidebar";
import { InvestUserMenu } from "./invest-user-menu";

export function InvestShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const me = useInvestMe();
  const unauthorized = me.error instanceof ApiError && me.error.status === 401;

  useEffect(() => {
    if (!unauthorized) return;
    const here = window.location.pathname + window.location.search;
    router.replace(`${investConfig.signInPath}?next=${encodeURIComponent(here)}`);
  }, [unauthorized, router]);

  if (me.isPending || unauthorized) return <ShellSkeleton />;
  if (me.isError) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-md items-center px-4">
        <QueryError message="We couldn't reach Fernway Invest." onRetry={() => void me.refetch()} className="w-full" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <InvestSidebar />
      <SidebarInset className="bg-white dark:bg-background">
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-white/90 px-4 backdrop-blur dark:bg-background/90 sm:px-6">
          <SidebarTrigger className="-ml-1 hidden md:inline-flex" />
          <Separator orientation="vertical" className="mr-1 hidden data-[orientation=vertical]:h-4 md:block" />
          <Link
            href={investConfig.homePath}
            className="rounded-md text-primary outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden dark:text-foreground"
          >
            <InvestBrand />
          </Link>
          <InvestCurrentTitle className="hidden md:block" />
          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle />
            <div className="md:hidden">
              <InvestUserMenu variant="compact" />
            </div>
          </div>
        </header>
        <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-10 px-4 pt-6 pb-28 sm:px-6 md:pb-12 lg:px-8">
          <main>{children}</main>
        </div>
      </SidebarInset>
      <InvestMobileNav />
    </SidebarProvider>
  );
}

function ShellSkeleton() {
  return (
    <div className="min-h-dvh" aria-busy="true" aria-label="Loading Fernway Invest">
      <div className="flex h-14 items-center gap-3 border-b px-4 sm:px-6">
        <Skeleton className="size-8" />
        <Skeleton className="h-5 w-32" />
        <Skeleton className="ml-auto size-9 rounded-full" />
      </div>
      <div className="mx-auto flex max-w-[1240px] flex-col gap-6 px-4 pt-6 sm:px-6 lg:px-8">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-72" />
      </div>
    </div>
  );
}
