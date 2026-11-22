import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { BrandMark } from "@/components/shared/brand-mark";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { AdminAccountMenu } from "./admin-account-menu";
import { AdminGate } from "./admin-gate";
import { AdminWorkspaceNav } from "./admin-workspace-nav";

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-svh bg-white dark:bg-background">
      <header className="sticky top-0 z-30 border-b bg-ink text-white">
        <div className="mx-auto flex h-16 w-full max-w-[1240px] items-center gap-3 px-4 sm:px-6 lg:px-8">
          <Link href="/admin" className="rounded-md outline-none focus-visible:ring-2 focus-visible:ring-amber">
            <BrandMark />
          </Link>
          <span className="bg-brand-gradient rounded-full px-2.5 py-0.5 text-[0.7rem] font-semibold tracking-[0.12em] uppercase">
            Admin
          </span>
          <Suspense fallback={<div className="ml-6 hidden sm:flex h-8 w-40" />}>
            <AdminWorkspaceNav />
          </Suspense>
          <div className="ml-auto flex items-center gap-1 [&_button]:text-white/80 [&_button:hover]:bg-white/10 [&_button:hover]:text-white">
            <ThemeToggle />
            <AdminAccountMenu />
          </div>
        </div>
        <Suspense fallback={null}>
          <AdminWorkspaceNav mobile />
        </Suspense>
      </header>
      <main className="mx-auto w-full max-w-[1240px] px-4 pt-8 pb-16 sm:px-6 lg:px-8">
        <AdminGate>{children}</AdminGate>
      </main>
    </div>
  );
}
